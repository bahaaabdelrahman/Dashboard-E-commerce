import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  isAddingNew = false;
  productForm!: FormGroup;
  previewUrl: string | null = null;
  currentDate: string = '';

  products: any[] = [];
  editingProductId: string | null = null;

  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.setCurrentDate();
    this.initForm();
    this.loadProducts();
  }

  // ✅ إعداد التاريخ الحالي
  setCurrentDate(): void {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    this.currentDate = `Today, ${day} ${month} ${year}`;
  }

  // ✅ تهيئة النموذج
  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      brand: [''],
      status: [''],
      price: [''],
      quantity: [''],
      discount: [''],
      size: [''],
      gender: [''],
      visibility: [''],
      date: [''],
      description: ['']
    });
  }

  // ✅ تحميل المنتجات من السيرفر
  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (res: any[]) => {
        this.products = res;
      },
      error: (err) => {
        console.error('❌ Error loading products:', err);
      }
    });
  }

  // ✅ عند الضغط على Add New
  onAddNew(): void {
    this.isAddingNew = true;
    this.editingProductId = null;
    this.productForm.reset();
    this.previewUrl = null;
  }

  // ✅ إلغاء الإضافة
  cancelAdd(): void {
    this.isAddingNew = false;
    this.productForm.reset();
    this.previewUrl = null;
    this.editingProductId = null;
  }

  // ✅ اختيار صورة
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ إزالة الصورة
  removeImage(): void {
    this.previewUrl = null;
  }

  // ✅ إرسال النموذج (إضافة أو تعديل)
  onSubmit(): void {
    if (this.productForm.invalid) return;

    const data = {
      ...this.productForm.value,
      image: this.previewUrl
    };

    if (this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, data).subscribe({
        next: (res) => {
          console.log('✅ Product updated:', res);
          this.cancelAdd();
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Error updating product:', err);
        }
      });
    } else {
      this.productService.addProduct(data).subscribe({
        next: (res) => {
          console.log('✅ Product added:', res);
          this.cancelAdd();
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Error adding product:', err);
        }
      });
    }
  }

  // ✅ تعديل منتج
  onEdit(product: any): void {
    this.isAddingNew = true;
    this.editingProductId = product._id || product.id;

    this.productForm.patchValue({
      name: product.name || product.product,
      category: product.category || '',
      brand: product.brand || '',
      status: product.status?.toLowerCase() || '',
      price: product.price || '',
      quantity: product.quantity || '',
      discount: product.discount || '',
      size: product.size || '',
      gender: product.gender || '',
      visibility: product.visibility || '',
      date: product.date || '',
      description: product.description || ''
    });

    this.previewUrl = product.image || null;
  }

  // ✅ حذف منتج
  onDelete(productId: string): void {
    const confirmed = confirm(`Are you sure you want to delete this product?`);
    if (confirmed) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          console.log(`✅ Product ${productId} deleted`);
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Error deleting product:', err);
        }
      });
    }
  }

  // ✅ بطاقات إحصائية (ثابتة مؤقتًا)
  statCards = [
    { icon: 'military_tech', title: 'All Orders', value: '$12,567' },
    { icon: 'shopping_cart', title: 'Need to Pay', value: '1,235' },
    { icon: 'inventory_2', title: 'Total Visitors', value: '842' }
  ];

  // ✅ بيانات مؤقتة للجدول
  orders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Laptop', date: '2025-07-08', status: 'Shipped', action: 'Action 1', size: 'M', inventory: 'In stock', model: 'X1' },
    { id: 'ORD-002', customer: 'Jane Smith', product: 'Smartphone', date: '2025-07-07', status: 'Pending', action: 'Action 2', size: 'L', inventory: 'In stock', model: 'A5' },
    { id: 'ORD-003', customer: 'Mike Johnson', product: 'Headphones', date: '2025-07-06', status: 'Delivered', action: 'Action 3', size: 'XL', inventory: 'Low stock', model: 'B2' }
  ];
}
