import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CategoryService } from '../services/category.service';
import { forkJoin, combineLatest, startWith } from 'rxjs';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: false
})
export class ProductsComponent implements OnInit {
  isAddingNew = false;
  productForm!: FormGroup;
  previewUrl: string | null = null;
  currentDate: string = '';
  products: any[] = [];
  filteredProducts: any[] = [];
  editingProductId: string | null = null;
  editingProduct: any | null = null;
  searchControl = new FormControl('');
  categoryControl = new FormControl('all');
  statusControl = new FormControl('all');
  categories: any[] = [];
  statuses: string[] = ['active', 'draft'];
  displayMode: 'list' | 'grid' = 'list';

  categoryProductCounts: Map<string, number> = new Map();


  constructor(private fb: FormBuilder, private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.setCurrentDate();
    this.initForm();
    this.loadInitialData();
    this.setupFiltering();
  }

  setCurrentDate(): void {
    const today = new Date();
    this.currentDate = `Today, ${today.getDate()} ${today.toLocaleString('en-US', { month: 'long' })} ${today.getFullYear()}`;
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      shortDescription: [''],
      description: ['', Validators.required],
      sku: ['', Validators.required],
      brand: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      comparePrice: [0, Validators.min(0)],
      category: ['', Validators.required],
      quantity: [0, Validators.required],
      isFeatured: [true],
      status: ['active', Validators.required],
      trackQuantity: [true],
      variants: [''],
      images: this.fb.array([]),
      specifications: this.fb.array([])
    });
  }


  get images(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  addImageField(): void {
    this.images.push(this.createImageGroup());
  }

  createImageGroup(url: string = '', publicId: string | null = null): FormGroup {
    return this.fb.group({
      url: [url, Validators.required],
      publicId: [publicId, Validators.required]
    });
  }

  removeImageField(index: number): void {
    this.images.removeAt(index);
  }


  get specifications(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }

  createSpecificationGroup(key: string = '', value: string = ''): FormGroup {
    return this.fb.group({
      key: [key, Validators.required],
      value: [value, Validators.required]
    });
  }

  addSpecificationField(): void {
    this.specifications.push(this.createSpecificationGroup());
  }

  removeSpecificationField(index: number): void {
    this.specifications.removeAt(index);
  }

  onAddNew(): void {
    this.isAddingNew = true;
    this.editingProductId = null;
    this.editingProduct = null;
    this.productForm.reset({ status: 'active', isFeatured: true, trackQuantity: true, price: 0, comparePrice: 0, quantity: 0 });
    this.previewUrl = null;
    this.images.clear();
    this.specifications.clear();
    this.addImageField();
  }

  loadInitialData(): void {
    forkJoin({
      products: this.productService.getAllProducts(),
      categories: this.categoryService.getCategories()
    }).subscribe(({ products, categories }) => {
      this.categories = Array.isArray(categories) ? categories : categories.data || [];
      const productArray: any[] = Array.isArray(products) ? products : (products as any).data || [];
      this.products = productArray.map((p: any) => ({...p, categoryName: p.category?.name || 'Uncategorized'}));
      this.filteredProducts = this.products;
      this.calculateCategoryCounts();
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(response => {
      const productArray: any[] = Array.isArray(response) ? response : (response as any).data || [];
      this.products = productArray.map((p: any) => ({...p, categoryName: p.category?.name || 'Uncategorized'}));
      this.applyFilters(this.searchControl.value || '', this.categoryControl.value || 'all', this.statusControl.value || 'all');
      this.calculateCategoryCounts();
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      alert('Please fill all required fields, including Image URLs and Public IDs.');
      return;
    }

    const formData = this.productForm.value;

    if (formData.comparePrice !== 0 && formData.comparePrice <= formData.price) {
      alert('Compare price must be greater than price.');
      return;
    }

    const specificationsObject = formData.specifications.reduce((acc: any, spec: any) => {
      if (spec.key) {
        acc[spec.key] = spec.value;
      }
      return acc;
    }, {});

    const baseProduct = {
      name: formData.name,
      shortDescription: formData.shortDescription,
      description: formData.description,
      sku: formData.sku,
      brand: formData.brand || '',
      category: formData.category,
      status: formData.status,
      isFeatured: formData.isFeatured,
      pricing: {
        price: formData.price,
        comparePrice: formData.comparePrice
      },
      inventory: {
        quantity: formData.quantity,
        trackQuantity: formData.trackQuantity
      },
      specifications: specificationsObject,
      images: formData.images,
      variants: this.parseVariants(formData.variants)
    };

    const finalData = this.editingProductId && this.editingProduct
      ? { ...this.editingProduct, ...baseProduct }
      : baseProduct;

    const request = this.editingProductId
      ? this.productService.updateProduct(this.editingProductId, finalData)
      : this.productService.addProduct(finalData);

    request.subscribe({
      next: () => {
        this.cancelAdd();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error saving product:', err);
        alert('An error occurred while saving the product. Please check the console for details.');
      }
    });
  }

  onEdit(product: any): void {
    this.isAddingNew = true;
    this.editingProductId = product._id;
    this.editingProduct = product;

    this.productForm.patchValue({
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      sku: product.sku,
      brand: product.brand || '',
      category: product.category?._id,
      quantity: product.inventory?.quantity ?? 0,
      price: product.pricing?.price ?? 0,
      comparePrice: product.pricing?.comparePrice ?? 0,
      status: product.status,
      trackQuantity: product.inventory?.trackQuantity ?? true,
      isFeatured: product.isFeatured,
      variants: this.stringifyVariants(product.variants || [])
    });

    this.images.clear();
    (product.images || []).forEach((img: any) => {
      this.images.push(this.createImageGroup(img.url, img.publicId));
    });


    this.specifications.clear();
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (key && key !== '_id') {
            this.specifications.push(this.createSpecificationGroup(key, value as string));
        }
      });
    }

    this.previewUrl = product.images?.[0]?.url || null;
  }

  parseVariants(input: string): any[] {
    if (!input || !input.includes(':')) return [];
    const [name, optionsString] = input.split(':');
    const options = optionsString.split(',').map(opt => opt.trim());
    return [{ name: name.trim(), options }];
  }

  stringifyVariants(variants: any[]): string {
    if (!variants || variants.length === 0) return '';
    return `${variants[0].name}: ${variants[0].options.join(',')}`;
  }

  onDelete(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(() => this.loadProducts());
    }
  }

  cancelAdd(): void {
    this.isAddingNew = false;
    this.productForm.reset();
    this.previewUrl = null;
    this.editingProductId = null;
    this.editingProduct = null;
    this.images.clear();
    this.specifications.clear();
  }

  getProductImage(product: any): string {
    const url = product.images?.[0]?.url;
    if (!url) {
      return 'https://via.placeholder.com/50';
    }
    if (!url.startsWith('http') && !url.startsWith('data:')) {
      return `data:image/jpeg;base64,${url}`;
    }
    return url;
  }

  getCategoryName(catId: any): string {
    const id = typeof catId === 'string' ? catId : catId?._id;
    const category = this.categories.find(c => c._id?.toString() === id?.toString());
    return category ? category.name : 'Uncategorized';
  }

  setupFiltering(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.categoryControl.valueChanges.pipe(startWith('all')),
      this.statusControl.valueChanges.pipe(startWith('all'))
    ]).subscribe(([searchTerm, categoryId, status]) => {
      this.applyFilters(searchTerm || '', categoryId || 'all', status || 'all');
    });
  }

  applyFilters(searchTerm: string, categoryId: string, status: string): void {
    let temp = this.products;
    if (searchTerm) {
      temp = temp.filter(p => p.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
    }
    if (categoryId !== 'all') {
      temp = temp.filter(p => p.category?._id === categoryId);
    }
    if (status !== 'all') {
      temp = temp.filter(p => p.status === status);
    }
    this.filteredProducts = temp;
  }

  toggleDisplayMode(): void {
    this.displayMode = this.displayMode === 'list' ? 'grid' : 'list';
  }

  calculateCategoryCounts(): void {
  this.categoryProductCounts.clear();
  this.products.forEach(product => {
    const categoryId = product.category?._id;
    const quantity = product.inventory?.quantity ?? 0;

    if (categoryId) {
      const currentCount = this.categoryProductCounts.get(categoryId) || 0;
      this.categoryProductCounts.set(categoryId, currentCount + quantity);
    }
  });
}
}
