import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {

  ChartDataLabels = ChartDataLabels;


  dates: string[] = [];
  selectedDate: string = '';
  currentDate: string = '';
  selectedPeriod: string = 'week';


  statCards = [
    {
      icon: 'military_tech',
      title: 'TOTAL REVENUE MADE',
      value: '$12,567',
      percent: '+8.4%',
      color: 'green'
    },
    {
      icon: 'shopping_cart',
      title: 'TOTAL ORDERS',
      value: '1,235',
      percent: '+5.2%',
      color: 'green'
    },
    {
      icon: 'inventory_2',
      title: 'TOTAL VISITORS',
      value: '842',
      percent: '+3.1%',
      color: 'green'
    }
  ];



  pieChartData = {
    labels: ['Electronics', 'Fashion', 'Groceries', 'Books'],
    datasets: [{
      data: [30, 25, 20, 25],
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350'],
      borderWidth: 1
    }]
  };

  pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        formatter: (value: number, ctx) => {
          const sum = ctx.chart.data.datasets[0].data.reduce((a: any, b: any) => a + b, 0);
          return `${Math.round((value / sum) * 100)}%`;
        },
        font: { weight: 'bold' }
      }
    }
  };

  // البيانات الجانبية
  salesCategories = [
    {
      name: 'Electronics',
      amount: '$5,600',
      color: '#42A5F5'
    },
    {
      name: 'Fashion',
      amount: '$4,200',
      color: '#66BB6A'
    },
    {
      name: 'Groceries',
      amount: '$3,000',
      color: '#FFA726'
    },
    {
      name: 'Books',
      amount: '$3,000',
      color: '#EF5350'
    }
  ];


  // بيانات الجدول


  orders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Laptop', date: '2025-07-08', status: 'Shipped' },
    { id: 'ORD-002', customer: 'Jane Smith', product: 'Smartphone', date: '2025-07-07', status: 'Pending' },
    { id: 'ORD-003', customer: 'Mike Johnson', product: 'Headphones', date: '2025-07-06', status: 'Delivered' },
    { id: 'ORD-003', customer: 'Mike Johnson', product: 'Headphones', date: '2025-07-06', status: 'Delivered' },
    { id: 'ORD-003', customer: 'Mike Johnson', product: 'Headphones', date: '2025-07-06', status: 'Delivered' },
  ];

  // products

  topProducts = [
    {
      image: 'https://2b.com.eg/media/catalog/product/cache/661473ab953cdcdf4c3b607144109b90/h/s/hs190.jpg',
      name: 'Wireless Headphones',
      price: 99.99,
      status: 'in stock',
      sold: 20
    },
    {
      image: 'https://www.buyonline.nestlewaters.com.lb/media/catalog/product/cache/b79525433353b05418e24689d0e29e6d/n/e/nestle-pure-life-330-ml-2_1.jpg',
      name: 'Smart Watch',
      price: 149.99,
      status: 'empty',
      sold: 15
    }
  ];


  barChartData = {
    labels: ['Visited Site', 'Add To Cart', 'Purchased'],
    datasets: [{
      label: 'Revenue',
      data: [2000, 3200, 5000],
      backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726']
    }]
  };


  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Steps'
        }
      }
    }
  };


  genderChartData = {
    labels: ['Visited Site', 'Add to Cart', 'Purchased'],
    datasets: [
      {
        label: 'Men',
        data: [65, 45, 30],
        backgroundColor: '#42A5F5'
      },
      {
        label: 'Women',
        data: [55, 50, 35],
        backgroundColor: '#EF5350'
      }
    ]
  };

  genderChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'x',
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#666'
        },
        grid: {
          display: false,
          color: '#f0f0f0'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666'
        },
        grid: {
          display: false,
          color: '#f0f0f0'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1
      }
    }
  };




  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };


  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    elements: {
      line: { tension: 0.4 }
    },
    plugins: {
      legend: { display: false }
    }
  };

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.generatePastDates(30);
    this.selectedDate = this.dates[0];

    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    this.currentDate = `Today, ${day} ${month} ${year}`;

    this.updateChart('week');
  }

  generatePastDates(days: number): void {
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      this.dates.push(date.toISOString().split('T')[0]);
    }
  }

  updateChart(period: string): void {
    this.selectedPeriod = period;

    if (period === 'day') {
      this.lineChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [500, 700, 800, 600, 900, 750, 1000],
          label: 'Daily Sales',
          borderColor: '#3f51b5',
          fill: false,
          pointRadius: 5,
          pointBackgroundColor: '#3f51b5'
        }]
      };
    } else if (period === 'week') {
      this.lineChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Current Week'],
        datasets: [{
          data: [3200, 4000, 2900, 5000],
          label: 'Weekly Sales',
          borderColor: '#3f51b5',
          fill: false,
          pointRadius: 6,
          pointBackgroundColor: ['green', 'orange', 'red', 'blue']
        }]
      };
    } else if (period === 'month') {
      this.lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [15000, 18000, 16000, 19000, 17500, 20000],
          label: 'Monthly Sales',
          borderColor: '#3f51b5',
          fill: false,
          pointRadius: 5,
          pointBackgroundColor: '#3f51b5'
        }]
      };
    }
  }


}
