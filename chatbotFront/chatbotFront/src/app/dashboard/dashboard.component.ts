import { Component, OnInit } from '@angular/core';
import { ChatbotService } from '../services/chatbot.service';
import { ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userCount = 0;
  fileCount = 0;
  historyCount = 0;
  intentCount = 0;

  questionsChartLabels: string[] = [];
  questionsChartData: number[] = [];

  pieChartLabels: string[] = [
    'Utilisateurs',
    'Fichiers',
    'Conversations',
    'Intents',
  ];
  pieChartData: number[] = [];
  pieChartType: ChartType = 'doughnut';
  barChartType: ChartType = 'bar';

  successfulCount = 0;
  errorCount = 0;
  successErrorLabels: string[] = ['Réussies', 'Erreurs'];
  successErrorData: number[] = [];
  successErrorChartType: ChartType = 'doughnut';

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.chatbotService.getAllUsers().subscribe((users) => {
      this.userCount = users.length;
      this.updatePieChart();
    });

    this.chatbotService.getAllFiles().subscribe((files) => {
      this.fileCount = files.length;
      this.updatePieChart();
    });

    this.chatbotService.getAllIntents().subscribe((intents) => {
      this.intentCount = intents.length;
      this.updatePieChart();
    });

    this.chatbotService.getAllHistory().subscribe((history) => {
      this.historyCount = history.length;
      this.updatePieChart();

      const countByDate: { [date: string]: number } = {};
      history.forEach((item) => {
        const date = item.date?.split('T')[0];
        if (date) {
          countByDate[date] = (countByDate[date] || 0) + 1;
        }
      });

      this.questionsChartLabels = Object.keys(countByDate).sort().reverse();
      this.questionsChartData = this.questionsChartLabels.map(
        (date) => countByDate[date]
      );
    });

    this.chatbotService.getAllHistory().subscribe((history) => {
      this.historyCount = history.length;
      this.updatePieChart();

      const countByDate: { [key: string]: number } = {};

      let success = 0;
      let errors = 0;

      history.forEach((item) => {
        const date = item.date?.split('T')[0];
        if (date) {
          countByDate[date] = (countByDate[date] || 0) + 1;
        }

        if (item.intentId != null) {
          success++;
        } else {
          errors++;
        }
      });

      this.successfulCount = success;
      this.errorCount = errors;
      this.successErrorData = [this.successfulCount, this.errorCount];

      this.questionsChartLabels = Object.keys(countByDate).sort().reverse();
      this.questionsChartData = this.questionsChartLabels.map(
        (date) => countByDate[date]
      );
    });
  }

  updatePieChart() {
    this.pieChartData = [
      this.userCount,
      this.fileCount,
      this.historyCount,
      this.intentCount,
    ];
  }
}
