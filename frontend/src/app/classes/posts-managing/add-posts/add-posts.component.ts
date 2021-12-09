import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-posts',
  templateUrl: './add-posts.component.html',
  styleUrls: ['./add-posts.component.css'],
})
export class AddPostsComponent implements OnInit {
  constructor(private service: SharedService) {}
  @Output() refresh: EventEmitter<string> = new EventEmitter();

  PostsList: any = [];
  CategoryList: any = [];
  file: any;

  // all these variables NEED to be added to the server
  occasion = '';
  region = '';
  body = '';
  congrat = '';
  postTitle = '';
  email = '';
  PhotoFileName = '';

  // All these variables do NOT need to be added to the server, they are here just to "fill in the blank" in the body.
  input1 = '';
  input2 = '';
  input3 = '';
  input4 = '';
  input5 = '';
  input6 = '';

  addPost() {
    this.bodyValue();
    if (this.file != undefined) {
      this.uploadPhoto();
    }

    // var category = this.CategoryList.filter((res: any) => {
    //   return res.CategoryName.match(this.occasion);
    // });

    //for server
    var val = {
      post_title: this.postTitle.trim(),
      postbody: this.body.trim(),
      Postcongrat: "empty",
      employee_email: this.email.trim(),
      CategoryName: "وظيفة جديدة",
      employee_region: this.region,
      post_Image: this.PhotoFileName,
    };
    console.log(val);

    this.service.addPosts(val).subscribe((res) => {
      //refresh the list
      this.refresh.emit();
      // set all input values to empty after submiting successfully.
      this.input1 = '';
      this.input2 = '';
      this.input3 = '';
      this.input4 = '';
      this.input5 = '';
      this.input6 = '';
      this.email = '';
      this.occasion = '';
      this.region = '';
      this.postTitle = '';
    });
  }

  selectedFile(event: any) {
    this.file = event.target.files[0];
  }

  uploadPhoto() {
    var time = new Date();
    this.PhotoFileName = time.getTime() + ' - ' + this.file.name;

    const formData: FormData = new FormData();
    formData.append('img', this.file, this.PhotoFileName);
    this.service.UploadPhoto(formData).subscribe((data: any) => {
      this.PhotoFileName = data.toString();
    });
  }

  bodyValue() {
    // we are switching the occasion values to change the value of BODY and CONGTAT accordingly.
    switch (this.occasion) {
      case 'زواج':
        this.body = `
           ألف مبروك! نبارك ${this.input1}/ ${this.input2} بمناسبة زواجه وذلك يوم ${this.input3} بتاريخ ${this.input4} سائلين الله لهم التوفيق والسداد في حياتهم، راجين من الله أن يرزقهم الذرية الصالحة.
           للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان`;
        this.congrat =
          'أسأل الله أن يبارك زواجكما، وأن يبارك عليكما، وأن يجمع الله بينكما في خير. اللهم اجمع بينهم في الخير وارزقهم الحب والمودة، وطول فى أعمارهما وذريتهما.';
        break;
      case 'ترقية':
        this.body = `
           ألف مبروك! نبارك ${this.input1} ${this.input2} بمناسبة الترقية لل${this.input3} ${this.input4} ب${this.input5}، سائلين الله له التوفيق والنجاح في المرحلة العملية القادمة.
           للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          'ألف مبروك على ترقيتكم. سائلين الله لكم التوفيق والسداد وأن يكون عونا لكم وحافزا لتقديم المزيد من العطاء.';
        break;
      case 'قرار تعيين':
        this.body = `نتقدّم بالتهنئة ${this.input1} ${this.input2} على قرار التكليف ${this.input3} ${this.input4} متمنّين له التوفيق والنجاح.
          للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          'ألف مبروك على تكليفكم الجديد. سائلين الله لكم التوفيق والسداد وأن يكون عونا لكم على حمل الأمانة.';
        break;
      case 'عزاء':
        this.body = `${this.input1} إلى رحمة الله ${this.input2} ${this.input3} / ${this.input4} ونسأل الله ${this.input5} المغفرة والرحمة وأن يلهم ذويه الصبر والسلوان.
           للتعزية بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          ' عظم الله أجركم وأحسن الله عزائكم. ونسأل  الله المغفرة والرحمة لفقيدكم وأن يلهمكم وذويكم الصبر والسلوان.';
        break;
      case 'حصول على جائزة تميز':
        this.body = `
          ألف مبروك! تهانينا ${this.input1} ${this.input2} ب${this.input3} حصوله على جائزة التميز لتفانيه بالعمل ولجهوده المبذولة سائلين الله له دوام التوفيق والسداد في قادم الأيام.
          للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          'نبارك لكم الحصول على جائزة التميز مع تمنياتنا لكم مزيدا من العطاء والتفوق.';
        break;
      case 'قرار تكليف':
        this.body = `تم تكليف ${this.input1} ${this.input2} ب${this.input3} ${this.input4} لقسم ${this.input5}، ونبارك له هذا التكليف سائلين الله له التوفيق والسداد.
           للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          'نبارك لكم ثقة معالي المحافظ لهذا التكليف ونسأل الله لكم المزيد من النجاح والعطاء.';
        break;
      case 'مولود جديد':
        this.body = `نتقدّم بأسمى آيات التهاني والتبريكات على قدوم ${this.input1}
           ${this.input2} ${this.input3} بـ${this.input4} سائلين الله أن يجعله من حفظة كتابه الكريم ويحفظه لهم إن شاء الله.
           للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          'يسرنا أن نتقدم لكم بالتهنئة بقدوم مولودكم الجديد سائلين الله أن يجعله من حفظة كتابه الكريم ويحفظه لكم إن شاء الله.';
        break;
      case 'تخرج':
        this.body = `نتقدّم بالتهنئة ${this.input1} ${this.input2} ب${this.input3} على حصوله درجة ${this.input4} في جامعة ${this.input5} راجين من الله التوفيق له وأن يعم بنفعها في المرحلة العملية بالمؤسسة.
          للتهنئة بإمكانكم إرسال بريد إلكتروني على العنوان `;
        this.congrat =
          'ألف مبروك حصولكم على الشهادة العلمية وعقبى لكم مزيدا من الشهادات العلمية والمراتب العليا.';
        break;
      case 'تنويم في مستشفى':
        this.body = `يرقد ${this.input1} ${this.input2} ${this.input3} من ${this.input4} في مستشفى ${this.input5} إثر ${this.input6} .ونسأل له الصحة والعافية وندعو له بالشفاء العاجل.
          للاطمئنان بإمكانكم إرسال بريد إلكتروني على العنوان`;
        this.congrat =
          'نسأل الله العظيم رب العرش العظيم أن يشفيكم وأن يمن عليكم بالصحة والعافية.';
        break;
      case 'مناسبة أخرى':
        this.body = `${this.input1}`;
        this.congrat = `${this.input2}`;
        break;
      case 'وظيفة جديدة':
        this.body = `${this.input1}`;
        this.congrat = `${this.input2}`;
        break;
    }
  }
  ngOnInit(): void {
    // this.service.getAllCategoryNames().subscribe((data) => {
    //   this.CategoryList = data;
    // });
  }
}
