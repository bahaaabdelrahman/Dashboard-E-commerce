import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {



  currentDate: string = '';
  dates: string[] = [];
  selectedDate: string = '';



  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.selectedDate = this.dates[0];

    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    this.currentDate = `Today, ${day} ${month} ${year}`;

  }







  statCards = [
    {
      icon: 'military_tech',
      title: 'All Orders',
      value: '$12,567',
    },
    {
      icon: 'shopping_cart',
      title: 'Ned to Pay',
      value: '1,235',
    },
    {
      icon: 'inventory_2',
      title: 'TOTAL VISITORS',
      value: '842',
    }
  ];


  orders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Laptop', date: '2025-07-08', status: 'Shipped' },
    { id: 'ORD-002', customer: 'Jane Smith', product: 'Smartphone', date: '2025-07-07', status: 'Pending' },
    { id: 'ORD-003', customer: 'Mike Johnson', product: 'Headphones', date: '2025-07-06', status: 'Delivered' }
  ];

}
