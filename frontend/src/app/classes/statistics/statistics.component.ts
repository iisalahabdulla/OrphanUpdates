import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import { SharedService } from 'src/app/services/shared.service';
import moment from 'moment';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit {
  constructor(private service: SharedService) {}

  date = new Date().getFullYear();
  PostsList: any = [];
  PostsListMonth: any = [];
  sharesTotalMonth: number=0;
  sharesTotalYear: any = [];
  DownLTotalMonth: number=0;
  DownLTotalYear: any = [];
  pie2: any = [];
  pie: any = [];
  months: any = ["01","02","03","04","05","06","07","08","09","10","11","12"];


  ngOnInit(){
    // get data from server then filter them by year
    this.service.getPostsList().subscribe((data) => {
      this.PostsList = data.filter((res:any) => {
        return moment(res.post_Create_date).isSame(undefined, "year")
      })

    // filter the data by each month
       this.months.map((item:any) => {
        this.PostsListMonth = this.PostsList.filter((res:any) => {
          return moment(res.post_Create_date).isSame(`${this.date}-${item}-01`, "month")
        })
        this.sharesTotalMonth=0;
        this.DownLTotalMonth=0;

    // calculate the total shares and downloads per month
        this.PostsListMonth.forEach((res: any) => {
          this.sharesTotalMonth += res.post_numberOfShares;
          this.DownLTotalMonth += res.post_numberOfDownloads;
      });
     // push data to the arrays to set the values of barChartData
      this.sharesTotalYear.push(this.sharesTotalMonth)
      this.DownLTotalYear.push(this.DownLTotalMonth)
      })


    // filter PostsList by region to set the values of pieChartData2
      this.pieChartLabels2.map((item:any) => {
       this.pie2.push( 
         this.PostsList.filter((res:any) => { 
        return res.employee_region.match(`${item}`)
        }).length
       )
      })
      this.pieChartData2 = this.pie2;

          // filter PostsList by occasion to set the values of pieChartData
          this.pieChartLabels.map((item:any) => {
            this.pie.push( 
              this.PostsList.filter((res:any) => { 
             return res.CategoryName.match(`${item}`)
             }).length
            )
           })
           this.pieChartData = this.pie;
 
    });
 }

  // create a chart, line type:
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
  };

  public barChartLabels = [
    'يناير',
    'فبرابر',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];
  public barChartLegend = true;

  public barChartData = [
    {
      data: this.sharesTotalYear,
      label: 'عدد المشاركات',
    },
    {
      data: this.DownLTotalYear,
      label: 'عدد التحميلات',
    },
  ];

  // create a pie chart:
  public pieChartLabels = ['ترقية', 'زواج', 'مولود جديد', 'عزاء', 'قرار تعيين', 'مناسبة أخرى', 'تنويم في مستشفى', 'تخرج', 'قرار تكليف', 'حصول على جائزة تميز'];
  public pieChartData = [0,0,0,0,0,0,0,0,0,0];

  // create another pie chart:
  public pieChartLabels2 = ['المدينة', 'أبها' ,'مكة', 'الشرقية', 'الرياض', 'القصيم', 'عسير', 'تبوك', 'حائل', 'نجران', 'جازان', 'الجوف', 'الحدود الشمالية'];
  public pieChartData2 = [0,0,0,0,0,0,0,0,0,0,0,0,0];

  // download a document
  download_doc = function () {
    // get all chart canvases
    var canvas = <HTMLCanvasElement>document.getElementById('canvas');
    var canvas2 = <HTMLCanvasElement>document.getElementById('canvas2');
    var canvas3 = <HTMLCanvasElement>document.getElementById('canvas3');

    // create images from canvas
    var image = canvas.toDataURL('image/jpg');
    var image2 = canvas2.toDataURL('image/jpg');
    var image3 = canvas3.toDataURL('image/jpg');

    // create a new doc
    const doc = new jsPDF();

    // get date for later dynamic texts
    var date = new Date().getFullYear();

    // set heights for later positioning
    var imgHeight = (canvas.height * 180) / canvas.width;
    var imgHeight2 = (canvas.height * 160) / canvas.width;

    // draw doc border
    doc.setDrawColor(85, 85, 85);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);

    // set font properties
    doc.setFont('times', 'bold');

    // add texts and chart images to the doc
    doc.text(`Statistics on ${date} `, 80, 30);

    // set font properties
    doc.setFont('times', 'normal');
    doc.setFontSize(13);

    doc.text(
      `This chart demonstrates the percentage of downloading share-form compared to downloading`,
      20,
      70
    );
    doc.text(`congrats-form on ${date}:`, 20, 80);
    doc.addImage(image, 15, 110, 180, imgHeight);

  
    // set the 2nd page and draw its border
    doc.addPage();
    doc.setDrawColor(85, 85, 85);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);  
    
    doc.text(
      `The first chart illustrates the percentage of the published posts per region, while the second `,
      20,
      40 
    );
    doc.text(
      `chart illustrates the percentage of the published posts per occasion type on ${date}:`,
      20,
      50 
    );

    doc.addImage(image3, 20, imgHeight, 160, imgHeight2);

    doc.addImage(image2, 20, 110 + imgHeight, 160, imgHeight2);

    // download doc
    doc.save(`statistics${date}.pdf`);
  };

}
