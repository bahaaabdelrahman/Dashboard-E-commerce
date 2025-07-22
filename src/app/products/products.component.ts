import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { combineLatest, forkJoin, startWith } from 'rxjs';



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
  editingProductId: string | null = null;
  editingProduct: any | null = null;

  filteredProducts: any[] = [];

  searchControl = new FormControl('');
  categoryControl = new FormControl('all');
  statusControl = new FormControl('all');

  statuses: string[] = ['active', 'draft'];

  categories: any[] = [];

  displayMode: 'list' | 'grid' = 'list';


  statCards = [
    { icon: 'military_tech', title: 'All Orders', value: '$12,567' },
    { icon: 'shopping_cart', title: 'Need to Pay', value: '1,235' },
    { icon: 'inventory_2', title: 'Total Visitors', value: '842' }
  ];

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.setCurrentDate();
    this.initForm();
    this.loadInitialData();
    this.setupFiltering();
  }

  setCurrentDate(): void {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    this.currentDate = `Today, ${day} ${month} ${year}`;
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
      isFeatured: [false],
      status: ['draft', Validators.required],
      variants: [''],
      imageUrl: ['', Validators.required],
      imagePublicId: ['', Validators.required],
      specifications: this.fb.group({
        processor: [''],
        graphics: [''],
        weight: ['']
      })
    });
  }

  updatePreview(): void {
    const url = this.productForm.get('imageUrl')?.value;
    this.previewUrl = url;
  }

  removeImage(): void {
    this.productForm.get('imageUrl')?.setValue('');
    this.previewUrl = null;
  }

  onAddNew(): void {
    this.isAddingNew = true;
    this.editingProductId = null;
    this.productForm.reset();
    this.previewUrl = null;
  }




loadInitialData(): void {
  forkJoin({
    products: this.productService.getAllProducts(),
    categories: this.productService.getCategories()
  }).subscribe({
    next: (data) => {

      this.products = data.products;
      console.log('✅ Products loaded from server:', this.products);
      this.filteredProducts = this.products;

      if (data.categories && data.categories.length > 0) {
        this.categories = data.categories;
        console.log('✅ Categories loaded from SERVER:', this.categories);
      } else {

        console.warn('⚠️ Server returned empty categories. Using hardcoded fallback list.');
        this.categories = [
          { _id: '64efcfba1c593e456c102f9b', name: 'Electronics' },
          { _id: '64efcfba1c593e456c102f9c', name: 'Fashion' },
          { _id: '64efcfba1c593e456c102f9d', name: 'Home Appliances' },
          { _id: '64efcfba1c593e456c102f9e', name: 'Books' }
        ];
      }

    },
    error: (err) => {
      console.error(' Error loading initial data:', err);
    }
  });
}



    loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => console.error(' Error reloading products:', err)
    });
  }




onSubmit(): void {
  if (this.productForm.invalid) {
    console.error(' Form is invalid');
    return;
  }

  const formData = this.productForm.value;

  if (formData.comparePrice <= formData.price) {
    alert(' Compare price must be greater than price.');
    return;
  }

  let finalData;

  if (this.editingProductId && this.editingProduct) {
    finalData = {
      ...this.editingProduct,
      ...formData,

      pricing: {
        ...this.editingProduct.pricing,
        price: formData.price,
        comparePrice: formData.comparePrice
      },
      inventory: {
        ...this.editingProduct.inventory,
        quantity: formData.quantity
      },
      specifications: {
        ...this.editingProduct.specifications,
        ...formData.specifications
      },
      images: [
        {
          url: formData.imageUrl,
          publicId: formData.imagePublicId
        }
      ],
      variants: this.parseVariants(formData.variants)
    };

  } else {
    finalData = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      sku: formData.sku,
      brand: formData.brand,
      category: formData.category,
      status: formData.status,
      isFeatured: formData.isFeatured,
      pricing: {
        price: formData.price,
        comparePrice: formData.comparePrice
      },
      inventory: {
        quantity: formData.quantity
      },
      specifications: formData.specifications,
      images: [
        {
          url: formData.imageUrl,
          publicId: formData.imagePublicId
        }
      ],
      variants: this.parseVariants(formData.variants)
    };
  }

  console.log(' Sending data to server:', finalData);

  const request = this.editingProductId
    ? this.productService.updateProduct(this.editingProductId, finalData)
    : this.productService.addProduct(finalData);

  request.subscribe({
    next: () => {
      console.log(' Product saved successfully!');
      this.cancelAdd();
      this.loadProducts();
    },
    error: (err) => {
      console.error(' Error saving product:', err);
    }
  });
}

  parseVariants(input: string): any[] {
    if (!input || !input.includes(':')) return [];
    const [name, optionsString] = input.split(':');
    const options = optionsString.split(',').map(opt => opt.trim());
    return [{ name: name.trim(), options }];
  }

  stringifyVariants(variants: any[]): string {
    if (variants.length === 0) return '';
    return `${variants[0].name}: ${variants[0].options.join(',')}`;
  }


onEdit(product: any): void {
  this.isAddingNew = true;
  this.editingProductId = product._id;
  this.editingProduct = product;

  this.productForm.patchValue({
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    brand: product.brand || '',
    category: product.category,
    isFeatured: product.isFeatured,

    sku: product.sku,

    quantity: product.inventory?.quantity,
    price: product.pricing?.price,
    comparePrice: product.pricing?.comparePrice,
    status: product.status,
    specifications: {
      processor: product.specifications?.processor || '',
      graphics: product.specifications?.graphics || '',
      weight: product.specifications?.weight || ''
    },
    imageUrl: product.images?.[0]?.url || '',
    imagePublicId: product.images?.[0]?.publicId || '',
    variants: this.stringifyVariants(product.variants || [])
  });

  this.previewUrl = product.images?.[0]?.url || null;
}

  onDelete(productId: string): void {
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (confirmed) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error(' Error deleting product:', err)
      });
    }
  }

    cancelAdd(): void {
    this.isAddingNew = false;
    this.productForm.reset();
    this.previewUrl = null;
    this.editingProductId = null;
    this.editingProduct = null;
  }

  getProductImage(product: any): string {
    return product.images?.[0]?.url || 'https://via.placeholder.com/50';
  }

  getCategoryName(catId: string): string {
  if (!catId) {
    return 'Uncategorized';
  }
  if (!this.categories || this.categories.length === 0) {
    return 'Loading...';
  }
  const category = this.categories.find(c => c._id === catId);
  return category ? category.name : 'Unknown category';
}


  setupFiltering(): void {
  combineLatest([
    this.searchControl.valueChanges.pipe(startWith('')),
    this.categoryControl.valueChanges.pipe(startWith('all')),
    this.statusControl.valueChanges.pipe(startWith('all'))
  ]).subscribe(([searchTerm, categoryId, status]) => {


    const safeSearchTerm = searchTerm || '';
    const safeCategoryId = categoryId || 'all';
    const safeStatus = status || 'all';

    this.applyFilters(safeSearchTerm, safeCategoryId, safeStatus);
  });
}


    applyFilters(searchTerm: string, categoryId: string, status: string): void {
    let tempProducts = this.products;

    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }

    if (categoryId && categoryId !== 'all') {
      tempProducts = tempProducts.filter(product => product.category === categoryId);
    }

    if (status && status !== 'all') {
      tempProducts = tempProducts.filter(product => product.status === status);
    }

    this.filteredProducts = tempProducts;
  }


    toggleDisplayMode(): void {
    this.displayMode = this.displayMode === 'list' ? 'grid' : 'list';
  }


}
