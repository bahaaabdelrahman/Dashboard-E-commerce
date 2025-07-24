import { CategoryService } from './../services/category.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, startWith } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  isAddingNew = false;
  categoryForm!: FormGroup;
  currentDate: string = '';
  categories: any[] = [];
  editingCategoryId: string | null = null;
  editingCategory: any | null = null;
  previewUrl: string | null = null;
  filteredCategories: any[] = [];
  searchControl = new FormControl('');
  statusControl = new FormControl('all');
  statuses: string[] = ['active', 'inactive'];

  // --- NEW Properties for new features ---
  selectedCategoryIds = new Set<string>();

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {}

  ngOnInit(): void {
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
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      parentId: [null],
      imageUrl: ['', Validators.required],
      imagePublicId: [''],
      isActive: [true]
    });
  }

  onAddNew(): void {
    this.isAddingNew = true;
    this.editingCategoryId = null;
    this.editingCategory = null;
    this.categoryForm.reset({
      isActive: true,
      parentId: null,
      imageUrl: '',
      imagePublicId: ''
    });
    this.previewUrl = null;
  }

  loadInitialData(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.categories = response.data;
          this.filteredCategories = this.categories;
        } else if (Array.isArray(response)) {
          this.categories = response;
          this.filteredCategories = this.categories;
        } else {
          this.categories = [];
          this.filteredCategories = [];
        }
      },
      error: (err) => {
        console.error('Error loading initial data:', err);
        this.categories = [];
        this.filteredCategories = [];
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryData = {
      ...this.categoryForm.value,
      image: this.categoryForm.value.imageUrl
    };

    delete categoryData.imageUrl;
    delete categoryData.imagePublicId;

    if (!categoryData.parentId) {
      delete categoryData.parentId;
    }

    const request = this.editingCategoryId
      ? this.categoryService.updateCategory(this.editingCategoryId, categoryData)
      : this.categoryService.createCategory(categoryData);

    request.subscribe({
      next: () => {
        this.cancelAdd();
        this.loadInitialData();
      },
      error: (err) => {
        const errorMessage = err?.error?.error?.message || err?.error?.message || 'An unknown server error occurred.';
        alert(`Failed to save category: ${errorMessage}`);
      }
    });
  }

  onEdit(category: any): void {
    this.isAddingNew = true;
    this.editingCategoryId = category._id;
    this.editingCategory = category;

    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      imageUrl: category.image,
      imagePublicId: category.imagePublicId || '',
      isActive: category.isActive
    });

    this.updatePreview();
  }

  onDelete(categoryId: string): void {
    const confirmed = confirm('Are you sure you want to delete this product?');
    if (confirmed) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => this.loadInitialData(),
        error: (err) => console.error('Error deleting category:', err)
      });
    }
  }

  cancelAdd(): void {
    this.isAddingNew = false;
    this.categoryForm.reset();
    this.editingCategoryId = null;
    this.editingCategory = null;
    this.previewUrl = null;
  }

  getCategoryImage(category: any): string {
    return category.image || 'https://via.placeholder.com/50';
  }

  setupFiltering(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.statusControl.valueChanges.pipe(startWith('all'))
    ]).subscribe(([searchTerm, status]) => {
      this.applyFilters(searchTerm || '', status || 'all');
    });
  }

  applyFilters(searchTerm: string, status: string): void {
    let tempCategories = this.categories;

    if (searchTerm) {
      tempCategories = tempCategories.filter(category =>
        category.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }

    if (status !== 'all') {
      const isActive = status === 'active';
      tempCategories = tempCategories.filter(category => category.isActive === isActive);
    }

    this.filteredCategories = tempCategories;
  }

  updatePreview(): void {
    const url = this.categoryForm.get('imageUrl')?.value;
    if (this.categoryForm.get('imageUrl')?.valid) {
      this.previewUrl = url;
    } else {
      this.previewUrl = null;
    }
  }

  removeImage(): void {
    this.categoryForm.get('imageUrl')?.setValue('');
    this.categoryForm.get('imagePublicId')?.setValue('');
    this.previewUrl = null;
  }


  onCheckboxChange(event: any, id: string): void {
    if (event.checked) {
      this.selectedCategoryIds.add(id);
    } else {
      this.selectedCategoryIds.delete(id);
    }
  }

  isAllSelected(): boolean {
    return this.filteredCategories.length > 0 && this.selectedCategoryIds.size === this.filteredCategories.length;
  }

  selectionHasValue(): boolean {
      return this.selectedCategoryIds.size > 0;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selectedCategoryIds.clear();
    } else {
      this.filteredCategories.forEach(cat => this.selectedCategoryIds.add(cat._id));
    }
  }


  bulkUpdateStatus(isActive: boolean): void {
    if (this.selectedCategoryIds.size === 0) return;

    const payload = {
      categoryIds: Array.from(this.selectedCategoryIds),
      updates: { isActive }
    };

    this.categoryService.bulkUpdateCategories(payload).subscribe({
      next: () => {
        alert('Update successful!');
        this.selectedCategoryIds.clear();
        this.loadInitialData();
      },
      error: (err) => alert(`Update failed: ${err.error?.error?.message || 'Server Error'}`)
    });
  }


  onFileSelected(event: any, categoryId: string): void {
    const file: File = event.target.files[0];
    if (file) {
      this.categoryService.uploadCategoryImage(categoryId, file).subscribe({
        next: () => {
          alert('Image uploaded successfully!');
          this.loadInitialData();
        },
        error: (err) => alert(`Upload failed: ${err.error?.error?.message || 'Server Error'}`)
      });
    }
  }


  onDeleteImage(categoryId: string): void {
    const confirmed = confirm('Are you sure you want to delete this image?');
    if (confirmed) {
      this.categoryService.deleteCategoryImage(categoryId).subscribe({
        next: () => {
          alert('Image deleted successfully!');
          this.loadInitialData();
        },
        error: (err) => alert(`Deletion failed: ${err.error?.error?.message || 'Server Error'}`)
      });
    }
  }
}
