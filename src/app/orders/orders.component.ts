import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  currentDate: string = '';
  orders: any[] = [];


  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.setCurrentDate();
    this.loadOrders();
  }

  setCurrentDate(): void {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    this.currentDate = `Today, ${day} ${month} ${year}`;
  }


  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        console.log(' Orders loaded successfully:', this.orders);
      },
      error: (err) => {
        console.error(' Error loading orders:', err);
      }
    });
  }


    getProductNames(order: any): string {
    if (!order.orderItems || order.orderItems.length === 0) {
      return 'No products';
    }
    return order.orderItems.map((item: any) => item.product?.name || 'Unknown Product').join(', ');
  }


  statCards = [
    { icon: 'military_tech', title: 'All Orders', value: '$12,567' },
    { icon: 'shopping_cart', title: 'Need to Pay', value: '1,235' },
    { icon: 'inventory_2', title: 'TOTAL VISITORS', value: '842' }
  ];
}
