import { Component, OnInit, ElementRef } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image';
// @ts-ignore
import { changeDpiDataUrl } from 'changedpi';

@Component({
  selector: 'app-posts-board',
  templateUrl: './posts-board.component.html',
  styleUrls: ['./posts-board.component.css'],
})
export class PostsBoardComponent implements OnInit {
  constructor(
    private service: SharedService,
    private spinner: NgxSpinnerService,
    private elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
  }

  PostsList: any = [];
  newPostsList: any = [];
  sortedNewPostsList: any = [];

  status: Boolean = false;
  region: string = '';
  timePeriod: any = '';
  PhotoFilePath = this.service.baseURL + '/';
  downloading: boolean = false;

  date = moment();
  threeMonthsBeforeDate = moment().subtract(3, 'month');

  saveData(data: any) {
    sessionStorage.setItem('data', JSON.stringify(data));
  }

  ngOnInit(): void {
    this.refreshPostsList();
    this.spinner.show();
  }

  refreshPostsList() {
    this.newPostsList = [];

    this.service.getPostsList().subscribe((data) => {
      this.PostsList = data.filter((res: any) => {
        return res.employee_region.match(this.region);
      });

      switch (this.timePeriod) {
        case 'week':
          this.PostsList = this.PostsList.filter((res: any) => {
            return moment(res.post_Create_date).isSame(this.date, 'week');
          });
          break;

        case 'month':
          this.PostsList = this.PostsList.filter((res: any) => {
            return moment(res.post_Create_date).isSame(this.date, 'month');
          });
          break;

        case '':
          this.PostsList = this.PostsList.filter((res: any) => {
            return moment(res.post_Create_date).isSame(this.date, 'year');
          });
          break;

        case '3months':
          this.PostsList = this.PostsList.filter((res: any) => {
            return moment(res.post_Create_date).isBetween(
              this.threeMonthsBeforeDate,
              undefined
            );
          });
          break;
      }
      this.newPostsList = this.PostsList.slice(0, 3);
      this.sortedNewPostsList = this.PostsList;
    });
  }

  onScroll() {
    if (this.newPostsList.length != this.PostsList.length) {
      this.loadNextPosts();
    }
  }

  loadNextPosts() {
    const lastPost = this.newPostsList.length;
    const newPosts = this.PostsList.slice(lastPost, lastPost + 3);
    // add newly fetched posts to the existing post
    this.newPostsList = this.newPostsList.concat(newPosts);
  }

  compare(a: any, b: any) {
    if (a.categoryId < b.categoryId) {
      return -1;
    }
    if (a.categoryId > b.categoryId) {
      return 1;
    }
    return 0;
  }

  downloadPostsList() {
    this.downloading = true;
    this.sortedNewPostsList.sort(this.compare);

    // set variables
    const BASE_DPI = 72;
    const scale = 2;
    const elements = this.elementRef.nativeElement.querySelectorAll('.pdfRows');
    const doc = new jsPDF('p', 'pt', 'a4');
    var height = 40;
    var lastCategory = 0;

    // loop through HTML rows and change their order according to their categoryId
    for (let i = 0; i < elements.length; i++) {
      if (i !== 0) {
        elements[i].innerHTML = `
      <td style=" padding: 20px; border-bottom: 1px solid #ddd;">
      <img style=" border-radius: 50%; width: 100px; height: 100px;" src="/assets/images/logo2.png">
      </td>
      <td style=" padding: 20px; border-bottom: 1px solid #ddd;">
      <b  style="color: #005838; font-weight: bolder;"> ${
        this.sortedNewPostsList[i - 1].post_title
      }  </b>
      <br ><span> ${
        this.sortedNewPostsList[i - 1].employee_region
      } - ${this.sortedNewPostsList[i - 1].post_Create_date.slice(
          0,
          10
        )} </span>
      <br><br ><span class="body">${this.sortedNewPostsList[i - 1].postbody} ${
          this.sortedNewPostsList[i - 1].employee_email
        }  </span>
      </td>`;
      }

      // create canveses from HTML rows
      domtoimage
        .toPng(elements[i], {
          height: elements[i].offsetHeight * scale,
          width: elements[i].offsetWidth * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${elements[i].offsetWidth}px`,
            height: `${elements[i].offsetHeight}px`,
          },
        })
        .then((dataUrl: any) => {
          var dataUr = changeDpiDataUrl(dataUrl, BASE_DPI * scale);
          if (i === 0) {
            doc.addImage(imgData, 'JPEG', 0, 350, 595, 480);
          }
          // add a new page if needed
          if (height >= 700) {
            height = 40;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, 350, 595, 480);
          }

          // check categoryId and add a new break-line if needed
          if (
            i !== 0 &&
            this.sortedNewPostsList[i - 1].categoryId !== lastCategory
          ) {
            doc.setDrawColor(0, 88, 56);
            doc.circle(265, height + 20, 4, 'D');
            doc.circle(295, height + 20, 4, 'D');
            doc.circle(325, height + 20, 4, 'D');

            lastCategory = this.sortedNewPostsList[i - 1].categoryId;
            height = +(height + 27);
          }

          // draw on pdf then save
          doc.addImage(
            dataUr,
            37,
            height,
            elements[i].offsetWidth / 1.5,
            elements[i].offsetHeight / 1.5
          );
          height = +(height + 7) + elements[i].offsetHeight / 1.5;

          if (i !== 0) {
            // order HTML rows back to normal
            elements[i].innerHTML = `
            <td style=" padding: 20px; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">
            <img style=" border-radius: 50%; width: 100px; height: 100px;" src="/assets/images/logo2.png">
            </td>
            <td style=" padding: 20px; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">
            <b  style="color: #005838; font-weight: bolder;"> ${
              this.newPostsList[i - 1].post_title
            }  </b>
            <br ><span> ${
              this.newPostsList[i - 1].employee_region
            } - ${this.newPostsList[i - 1].post_Create_date.slice(
              0,
              10
            )} </span>
            <br><br > <span>${this.newPostsList[i - 1].postbody.slice(0, 90)}..
            <a style="  color: #005838;" _ngcontent-uog-c55="" routerlink="/details" routerlinkactive="active" ng-reflect-router-link="/details" ng-reflect-router-link-active="active" href="/details"> المزيد.. </a>
            </span>
            </td>`;
          }

          if (i === elements.length - 1) {
            doc.save(`newsPaper.pdf`);
            this.downloading = false;
          }
        })
        .catch(function (error: any) {
          console.error('oops, something went wrong!', error);
        });
    }
  }
}

var imgData =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAEAKADAAQAAAABAAAC1AAAAAD/wgARCALUBAADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAwIEAQUABgcICQoL/8QAwxAAAQMDAgQDBAYEBwYECAZzAQIAAxEEEiEFMRMiEAZBUTIUYXEjB4EgkUIVoVIzsSRiMBbBctFDkjSCCOFTQCVjFzXwk3OiUESyg/EmVDZklHTCYNKEoxhw4idFN2WzVXWklcOF8tNGdoDjR1ZmtAkKGRooKSo4OTpISUpXWFlaZ2hpand4eXqGh4iJipCWl5iZmqClpqeoqaqwtba3uLm6wMTFxsfIycrQ1NXW19jZ2uDk5ebn6Onq8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAABAgADBAUGBwgJCgv/xADDEQACAgEDAwMCAwUCBQIEBIcBAAIRAxASIQQgMUETBTAiMlEUQAYzI2FCFXFSNIFQJJGhQ7EWB2I1U/DRJWDBROFy8ReCYzZwJkVUkiei0ggJChgZGigpKjc4OTpGR0hJSlVWV1hZWmRlZmdoaWpzdHV2d3h5eoCDhIWGh4iJipCTlJWWl5iZmqCjpKWmp6ipqrCys7S1tre4ubrAwsPExcbHyMnK0NPU1dbX2Nna4OLj5OXm5+jp6vLz9PX29/j5+v/bAEMACQYHCAcGCQgHCAoKCQsNFg8NDAwNGxQVEBYgHSIiIB0fHyQoNCwkJjEnHx8tPS0xNTc6OjojKz9EPzhDNDk6N//bAEMBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//aAAwDAQACEQMRAAAB7jbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21JmFVttWSrUmZTSsmanbVttW21bbVkqTSttSFxFK21ZKk0rRNbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbUlSVVttW21bbVkq1JmU0rJmp21bbVkqTSttWSrVEpmp21JmUUvbVttW21bZNK21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttUQpNK21bbVttW21bbVkq1JmUUvbVkqTSttW21ZC4qclVaJ1JVEUrbVtorRlVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttSVJmp21bbVttW21bbVkqip0TWidUSlVbbVttUaU0rRNZKtSVJmpRlVO2rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbaslSaVomttq22rbattq22pKkqrbakqSqttq22rbakLiKVtqyF6onattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbakqTNTtq22rbattq22pKkqrbakqSqttq22rbatE6kqTNTtq22rImanbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWSpNK0TW21bbVttW21JUlVbbUlUap21bbVttW21ZC4qclVaJTWVtW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttSJVqTMxU5OpWTqVk6spCqnbVkqTSttW21bRFKydSttSVJVWTOqdtW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVtEUrJ1KyZqdtW21bbVttW21bbVttW21ZKk0rbVkqTWVtWidSVJmoVGqFJVWTMUrbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttSZlNKyVVonUnK1JytScrUmdFKydSsnUrJ1K0TWSrVEoVUpUmlbattqyVRUp2rKRqlUTW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttUJXq2Qqp21bbVttW21bbVttW21RCtSVQmloVqlOmpyVVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVkq1JVCaXomttq22rbattq22rZOpWSqk5Sa0TNadq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbakKlNKyVVttW21bbVkqTSttUQrUnK1JVtW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bJ1KTpqMrUhUppWia22qEr1RKFVO2rbakzE1O2rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatk6lJyqTlaonattq22rbak5UVOSqttqyVakqiKVtqyVakqiKVomttq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22pOyq22rbattq22rbattq22rbaoSvVEp1K21bbUhUxU5OpWTq22pW2rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rRMVpSqttq22rbattq22rbattq22rbasnasrattq2yaVk6lZOqdGpW2rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbakKlNKyZqdtW21bbVttW21bbVttWTCqhW1bbVojVC9q22rRGrTOrbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rROpOVqSqIpWTqVomttq2yalMqqJ2rbRUoyq07VttUJlVRO1bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttScrUmZTW0zW21bZNbTNbbVttW21RCk0rbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21aI1QqdW21bbVttW21ZKtSZ2qMrUnKTULTqVtq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattqyYVUK2rbattq22rbattq22rbatoioVKa201Ckqrbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbatsmtsqttq22rbattFTk6lZOpWTqmJmk5WpKtqiIXWSpNK21bbVtk1p0VMaanJVW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbUmdFKydUxM0nK1JytSZnVttW21bbVttW21ZKk1M7VkqTSttW21RGVWTMVlJmomUUvbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW2ipydSsnUrJ1K21ZKk0rbVkq1JmU0qI1TO1RoVUQpNKidW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttURlUnK1JytUTtW21ZKk0rbVkqTSttW21bbVttW2ioUlVZKk0rbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21ZKk1M7VttW21bbVttUaJqdtUaFVttW21bbVttWRl1ttWidSVJmp21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbUmYVW21bbVttW21bbUlSVVttSVJVW21bbVttWTMVM7VttW0TWSpNK21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21ZKk1M7VttW21bbVttW21JUlVbbUlSVVttW21bZNQuJrbasnaoXEUrbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttSZhVbbVttW21bbVttW2ioUlVbaKhSVVttW2iomFVttWjRWVtWSrVEpVW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWSpNTO1bbVttW21bbVojVsrVttWSpNTO1bbVkZdbbVtk1C4mttq22qNKaVtq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbakzE1O2rbattq2Tq2maidq22rbaslSaVtqyZipnattFRsqttq22rbatE6ttq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbaohSaVkzU5OqYmaidq22rbattq22rJUmlbJqF7VttWSqKnRNbbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWGQVF21bbVttW21bbVttW21bbVttW21bYNGyJpW2rbattq22rbatE6onattq22rbattq22rbaslSKmYVW21bbVttSVJVW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVm5gU50TW21bbVttW21bbVttW21ZKooSw6iIiKWpM0bCLW21JSlFOdtW21bbVttW21bbVttW2ZU9zOad4ZK2bnqdtW21bbVttSZlNK21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbUMJx0RaVVttW21bbVtk0rRNbbVttWEsdITk0tCNR5SekSXVttQ0K1F21bbVttW21bbVttW21Zi+Y09CoVFKFdNHLM9OttW21bbVttWSpNK0TW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21ChbWnJELrbatkqrbakJVFLmJrbattqyVahoOOmq0FqXETW21bbUNCtRdtW21bbVttW21bbVttWYP2FTKZpylSaCvTTnbVttW21bbVttSVJVW21bbVolNK21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bYdEw0UfbVttW21bZFIiYqTCiltRTWcAirCWDylJXqQvattFTtq22rbami0ko22rbJoZWTmtGmiTGqchNLyVUrbVttWSPUWUTSmD9hSTCXTgZBUmFTTmULrbattq22rbRUTopW2rbasmYpW2rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbDqYhVJUFdLRk1pia0rTUaYpa0LpDdS62SqljIKmpILTeYmpds3lF21aBiowhxRys107wTVttTVaF0fC1FaKiodiLQkyqpQoNLWNxQ5kVHyVVhZNSmD1AlLpDWwYUkiV04EQNKUjUYgiVsiamQzRUxFIxB04SqKnJVW2TWmFVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWSrUOV6gqXNCgyaGJ0mk5WpGXFaUTQsWaCRSaWBQax0LoEuEUlYyUVKV0OCIpMG1CylVEyutKE0EiZpQjBpSYc1lxFIlM1I1pqTCiiNyJokpmhKhVKQuKxUqrV1izoKjqrDNFCkk0JSk0ouihYuoSXKKSI46PtqiFakzOrbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq0TqjbVtOqNOrbaslUVttW21JmNW21TMKrbaslWrROqNOrbattqTMTU7aslWpKkKrbapidUaYrTE1ttUTtUbapjTUQpFTomp2itMap2mttq22rROqNOrbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattqiJipmJrJVqQqdW21aNq07VttW21bbVtoqNE0rbVttUTtUbRSttW21bbVttW21bbVttWQtFaYmpiYrbalbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbattq22rbao2ipnattq22rbao06ttq22rbattFaNFaY1SpM1O2rbaoidU7attq22rbattq22rbashaK2VFTtqTKVUrRFKydSsnUrJ1KydSsnUrJ1KiJrRM1ttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttUQpNTO1bbVttW21bbVttW21bbVonUnaaiJ1baa201ttUbRSttW21bbVttW21RGVScrUlJE1onVEzNDVM1E7VttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVkqip21bbVttW21bbVttW21bbVttUTtUQqK201ttW21aJ1bbVttW21bbVttWSrUnK1JytScrUnK1JytSZmK0xFKydSsnUrJ1KydSsnUrJmp0TW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21aJip21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttW21bbVttWiYrRM1/9oACAEBAAEFAv8AkWj92n88P5gf8jL5/ep/ywKn8159z/yOlP5jz/meH/IyD/UR+9w/5Ho/8jeP508PuDh/Pcf+RfP88PuD/kbx/Oj7g/mOH/Izn+dH3PP/AJHvz7+f/I3n+c8+5/1Af+Rs8+54fzXD7o/5GE/zZ+6P+Ryq6/zB+6P5vz7Dh/yM1HTtq9fvj79PuHsf+Rz8/uU+4Ox7Hh/yLmr17Vdf9RefcfzAZ/5Fw/eo6dte1XX+f8/vh+f/ACNFHTtr2q6/zHn98Pz/AORe4f6i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rGTLPV3KGXND2JUM2GkE/q/4N/xz/vJIu+aupBXJSZRD0oYfP83QJV5s+RH/ADic1me33f56IkPJt77L/wAQTaEPq933fZvKR3zR5jY2sowPm6Y8N259/wDX+/8AntXC9TQgsfdIQfrlAaH4oVfCo05HVgIIfn/g8VSI8RWel+qPBsU5sCCY/wDwvk0I4/8A1hB4/wCR93/A35LL/wCbKf8AS+KV+LM1+LE7/Knu/N9NgxjptIkhx6saS8Jukx9Ug2X7sHEnw1UOvksADv3eAIsRkfl/yIdvEF2/NZedilLKDysPf5vNiOBWoeYszJD4vRK8gTXM3YHnz/yUZSQg/N54flQflWDvKw7QsL8LDcUO5vwVEE5RhMFjbH8tGz76oT1FetADj/o/RLQTzQAbYBO7jyFIurHz+quIMLtH2GKk82Hi+iw8H/AzJH/AcvJ/+wHf/wCB/wCT/wDgOP8A8EJnv/seaIIP/wAR/wDgaf8A6Mf/AICgHH/7AR/+S/8ACv8A+EP/AM7un/4fil7vX/6A/wDS9/8AJp/+xh/1P+B/+e80/wDwx/zu9f8A6A8/9OL3/wDsa8f8OP8A9Da83v8A/SHmn/Div/7Gv/D/APQp/wCzT/8AE/8A6C80/wCHFf8A9Ck82Hmw8/8A666//Qt//DNn/wDC/wD6C804rzTj/o2Hmw82F+Dfg2WvhfpfpYfNhr5L8mwsPFg8WP8A9dP/AOh7Yvx/+CLt3/rx/wDmLFlqXxfpfpWZ5sNPs0+VhYeKCOLH/wCzy0L3/wALH/4X/wDM6f8A4U27Yp/x/wD2gj/he6lP/wBCh4v2vybD5WPK/S/Sy+LL5X4P/EPNh5s//sT3/wDoz/8AqCLDxYWF+TYajyv0v0s+Fl8r8Gw92Hmw82f/ANdnP/7CweLDxf/aAAwDAQACEQMRAAAQ88888888888888888888888888888888888888888888og8cUU0888Ys00MU888888888888888888888888888888888888888888888888sQ88sYQ088g0cUsU088o888888888888888888888888888888888888888888888408888MU8sU88U8E8sU888888888888888888888888888888888888888888888sU888884Uoc88A840cc8888888888888888888888888888888888888888888888I88888ocoU88so0Yc48888888888888888888888888888888888888888888888sM8888oE8U888sw88488888888888888888888888888888888888888888888888M08888U8o8888cQg088888888888888888888888888888888888888888888888sokM48o8Y88gAsUQ488888888888888888888888888888888888888888888w44w0888888o8A8s0oEE88888888888888888888888888888888888888888888kAcsAU8I40w8cI88IQMM888888888888888888888888888888888888888888888YY888888sMMcAc888888888888888888888888888888888888888888888888888c0888884woc0U8888888888888888888888888888888888888888888888888840skw888oc8Ms88888888888888888888888888888888888888888888888844UEwwsQ488s888888888888888888888888888888888888888888888888844QM888sYw8cg0M4088888888888888888888888888888888888888888888884gM8888888808sgMg48888888888888888888888888888888888888888888888s8888888884o08wo048888888888888888888888888888888888888888888888sww8888884Y88osc4E888888888888888888888888888888888888888888888888MMoQ488w84cc8wc8888888888888888888888888888888888888888888888888888MIUUcwkc88o8848888888888888888888888888888888888888888888888888888844088888sEAs0888888888888888888888888888888888888888888888888884M88888888g0Yc8888888888888888888888888888888888888888888888888ws88ww4wEAMsooc8swQY88888888888888888888888888888888888888888888YEQEsMM8888s8g88g8EU8888888888888888888888888888888888888888888888884w08wI8g88EkcY0s888888888888888888888888888888888888888888888888AM88sA8E88884IIU88888888888888888888888888888888888888888888888wc8888s8I8888Yc8c88888888888888888888888888888888888888888888884k88888Q888880c88M88888888888888888888888888888888888888888888884088884woU88gs4sk88888888888888888888888888888888888888888888888088888sUs884s8oUo0888888888888888888888888888888888888888888888w88884wUc404Y84s88A888888888888888888888888888888888888888888888s884oo888ocQc8w8888888888888888888888888888888848888888888888888sQ4E888888g08IU88888888888888888888888888888888Q8888888884kc88888c8888888Us88sQ88888888888888888888888888888888MU88888888QEQQ8E88888880kwA8888g88888888c88888888888888888888888YU888w088AeOYQco8888888AIsk0888s888888888888888888888888888888880Qw48A8888EKE88Q0888888QMcoU888sU8848888U88888888888888888000884qsMe8cc408o488wo0kwc4ccEGuaU888wY88I8888888888888888888oc60+20wuMAEGo4QAwQoCoAA8oAscYUcgW2EUosIwIQ8Y8888c888888888888884wYkYcEgYOU+GossQsMo+kSsYkEgg2UYU+ygWg0gIsscc8888U888888888888888MMYI88ccwkg6QccMM8oosYowUkossYIsQgkM888M88888888U88888888888888888888888YcME8c0888sY08sM88M88sccIcIU888888888888c88888888888888888888888M0888oU88gUs008Y88888888wEo0480044YY8888888888888888888888888888k08888888IgY8Q8g88888A4AQ8wsMM8888888888888888888888888888888888cc8888888ss8Y88c88888cs8cs4kk80w80w48888888888888888888888888888o8888888888888888888888888888888oUMY/8QAMxEBAQEAAwABAgUFAQEAAQEJAQARITEQQVFhIHHwkYGhsdHB4fEwQFBgcICQoLDA0OD/2gAIAQMRAT8Q/wD7cB//2gAIAQIRAT8Q/wD7cB//2gAIAQEAAT8Q/wD2aTDk0hB+fP8A1qFkx8l6GTyUBIyf/ltxDwp/3lOXD4//AAuJXafn/wDaRum8EU//ABIdUvJeh+yiJIyWf/ycn7n/ALAh4rbwP3/+BmHg4bE99nj/APaTJvmf/wAlEyper1GeSiJI5/8AkGL3/wDgYE4cWJPfZ4//AAGH8x5qAJx/+0eXo40//Ij/AIiZUvVnwfZxREkf/wALcfaU/wDwFUHwoyScf/g8HJ/H/wCQ1ex78f8A7NgEPDUwrkz/APMYsqXqz4I9nFEeH/8ABiXij/8ACcHZz1Z/6kkNS58dv/xRDteCxEury/8A7OZOvD/+cDHG6f8A4OWm/wD4QCHitHsOHyf/AIACGtLyH7//AAIBXilXu6PH/wCzqSQ8VJL5P2f/AJuF62n/AEyj1VPwf/iiZycNiezk/wDwTwnDhsTw9nj/AI05Ojnv/wDZ/gPXPxSH/wDMMl6qlvX/AODo8Kf/AImmUfs8lGQTj/8AAVfmPNQJOK1R47UIIP8A9n+apL64+P8A83h8n/W4P3P/AONv5D+H/wDCiZx68WJH5fP/AO0JSBz/AAoiCf8A5bcw8f8ATQhez/8AIQSHitX4nzZ//abZ15Kf/lNx9LT/ALhvMn/5MT302JvDk/8Axticdv8A9nwwJybUATj/APL4+X/4GVeP/wAoUe45PNQBP/woQcnFgR+//wBn2/DOn/5eF+T/APByeqf/AJLXkOTvr/8AAEjU3kf1/wDtCiZyaWIf/wAru8f/AIBlHqqfi/8Aykkh4s1P5Glac3Q58/8A7RRdaBR3OrDsPq+/8lG4H5ojx/8Ai5fW04/63o8Kf/lxl+T/AJN4P/2kj/inI/H/ADQ6R93xWjw/ZZHS+75V9NlQhJ4rmbx/+CEfv/8ACPJvgB5bJ5m9NFgUjw/97vH/AAo+KmC9f8WOf/2wMXv/AKbK0GB35vAG+X/oIVHHhz/zlfG/85j6p/zieP8A9mUTiV4LHl8IsjkPw2Zz9F80nyUTgUZs2f8A8/DeRP8A8HN6X/8ACVB65PJREk4pn4qp+K9Xn/iJ76LE9vP/AOzIYE5GYpCSxY/4pyH4vrj4voH3fD+RZHSsXK+mx7B8lH6WR4Sz/wDksgnJpSEn48f8i4Lzv/4vlnH/ADh9ZeD8v/OU4KP/ANmpWSPK6wR/L/8AFFix/wAgeiydLHpHw2Lh/Zcdqw8/i3HIfV8zHyUThP8A8Ay8dP7ozxx/zDeSP/xEI/FHESO4LPkJuTZAZOdVPEh2tA//AGcAQ2XGv8NvO/8A6AtyK9Uj5GigfR8/9ODtx6pcjyT/APtTLejsoDP/ANBQSEy75fsKIJHKARrD2HD5KYFcr1/+1EWVkjysrBH8v/0GKozz7PND0ey9Tk4bJwPc8WAJ/wD2qAQ2Xm8qP/5k3k9rjgfVF7P+jozo1fQdd2DmLH/7V82W9lAM/wDylOOVQgg4/wCIeQvik+Gw8fmWR0vuxPK8tP8A9qJs/wD4ZWVHl5srwfys/wD5GjoYf/tcDJl8F8IPLZvK+jLLOvLxRkz/APCAhvB2eaP/AOJSJ9WIP/2rS7l8F6A9m65n1Q4Af/glvZQDGn/YsTYVOigGf/hK55NqBJ/+0816t+LPAHyuuT8qAYB8f/jbO8H8rIwkeH/4WysqPLzZWCP5f/hhZIf5usCH+f8A9o5rJEl6voB72xdSvdADD/8AMLl9PiiUfV//ABAIbJxvo3n/APAAhJL/AIGlASP/AO0GaCV4KT1y+OihHH/6AkkPFh474eKgSOf/AIcbHlnigMfqzZ/7Kyo8qzINP/2fEl98fH/6Io9vZ5o/Lw//AIYq3InzfFJ8Nn19lgdfssjpfd8y+m6XDr3/APs84b1c/F/+inksJ3UuEf3/APjn/shylDgj8f8A7PCUeSuT54//AEQPl0eaqzz6PH/4W65E82X0PlqLo+CzefovmV+Wg9Lg/f8A+z/I7c+qMn/6FrBP8LDrvl/+EBLY1wf42xH/AOBQJWz4Xk90Bn/7P82a3HpsXJ8m3hE//PlUce6IQf8A4YWBPhY2Sf4f/hEYCfAo1nfro/8A2k5QLM5Ph2w8yPJRO49P/J//ACECVyw888PNACA//DLHGhGfb/8AhnwvLzSGH/7UIeQfm45NeQB6yx4kvZRHhs//AIB5c9HmiX4Tx/8AhAS2HxeHmhBn/wCHlph/+1iTeyS9WBwg93HBKDgjdYJ/hYdWVy//AIRwb0CjmWXr1Y//ABJIjVJDyY//ALXRYqnUPkoCD/8ACpR9nxTGc+X/APJeTrH3/wDtojS0OWTw7aAEBn/5RwOeqY3Hsalyl1yPqyuAfLZ+fxL5pflrSWfDT/8AasMcvQVV5Xo8WP8A8zhA0LgP/wAClH2fFL5dr3eB+/8A9qlL+R6KXs9r/wDoKgS8X5D92gCAytPY/VOIy+7vJ8f/ALTqBK5d/wAq0AQGf/oIcueg7o1P1PH/ACJ76PNimdXLVI0QXr/9ph9noO6JZ+p4/wDz0uR+b7l+Cz6pK4B8t5Tvl/xYJeKVfiPH/Ng8sf8A4moMOrwDN5BiiIH/AOziRhl7fFPTr2v/AOKbNmpcj83xK/BZPH3WfAfLYXQ+CzefqvmF+WhcD8UI/wDw/gfv/uh8b/8AiYAOXFwL+7f34uR+LA3k5/8A2acZe4oCA/7ByL4pfgs3j7LK6Hy2F0Pgsnm3mJ+WhcD8f/mcQHligAHH/dN4I/8AwqArSpffB4P+cj5W8R8CxTKP2eaMmf8A7MgCNh9fiyebeYn5aBwPx/yP/wBB2fuf/wAGT7mf/wAPwhz/AMcGmKHVGQa34V4//aubP/4HR6//AAJWRh8lniSeS8I/X/ImcvFyO+3/AJn4KIB6plHqqfi/5E99Pj/9ops2f+IOU/N9aw6T6s3C+2yuh8thcg+CzgVY/wDwa+s//EPI+7D4fZYWVV8/96/KU/50+F//AGjiTEvRZXQ+7C5B8Fk8/VfNL8tB6WA4P+xW93n/AK7vZ5//AC2x7n/jcD7p/wDtEaPWD5//AC+D2/8A4OH3/wDlKEtaex/X/dg/fxTf/wBoUw5cLEH/AOVhPq4+L/rhvVMF6/8Ayjk6ce//AMDpcq+uPj/9oTR6MP8A8vNDAP8AvT5//KUo8dqEEH/4Q4OT91AE4f8A9n4DOXCgAf8A5f7E/wDwKU//AJJjOTixI/fn/wDHr6On/wCz+voYf/mcH3T/ALwvAv8A+RAlvY5f1/8AhGeHP+8Byaf/ALPKCDlwogD/APM16h/601ej/wDIORw490//AANXu7fBQg8v0/8A7Q6Ohh/+Y034Uf8AG7X3/wDialQ47UIIP/wZA5cFie3l82QGo5wf/s+oIOXCgAHX/wCY3X0n/W9nlf8A8UGcnFgR+f8A8ACWlnsf1/0Qx659lGSev/2e29DD/wDNUErBdy8uf9wvimA9f/hAS1vY/X/4Fg28oY4P7/8AwvTxz/8As6SAHLhQADg//LWObPBn28U1Ll/+BxQwP/wnwHHv/wDCuDhy+af/AIYGcnFiHvv/APZzR14P/wAtlhl56o3VPrq8f/h4h5FP/wAG0OO1CD/8DV7nl8UBB/8Aj+Gef/2bcMeKIB4P/wAiaEwJerPS+jihHGf/AI+L8v8A+CCAa4pGP35//BAzV4LE115f/wAgAR4f/wBmzNBk/wDxgMGvgvYQeCgCAyx/+Rz8P+gEtbeR+v8A8CArSr2PB4p/+0aTlUS+Tj2f/hHHL4LHOh4KAw//AC9L8H/eU4cHn3/+Bvc8Dv8A+03kQnDR4Mezhs3T81LufRfqfuhwP/zeK8r/AJ6AcqEccf8A4Zgqhf8A9g2TYdv/ANHn/wDN9T8WA4I+P/znC8VQzk4sSP35/wDxNz9g/wD2DHyodf8A6MnY2VAKX1RkBDk8f/pbcISPD1YlSV/+Rn6jT/8AYFqhT8jkmn/6CpHc8UqMBjjn3WCd+rufneaZQOAv9WVV5PReGHmT/wDDBQS4lo4AS8H/AOnmQ76rgfJ/+wOgxJzUGEIh8KxeDvOfP/6FMWfYFVS87NXJC/R9/ixNsgT18UQzezn6rOOflwWA6iJw/wDwQgCKGSYmoA5dLHjf/wA9piAmAGk0r6UjxBQOCbKBVhgvz/yQcSkz30UjOEn/APKy+Bz/APYEqoJhFPVIt6dCPzFmKpnhiM6//QXrrjgY/unrIbK2KE4/Fk5FuDxvjxSCxmSvFSpD4GT7f9Ug4hzjPNmFk/VACk8JT/ij3kTUMCIB2R/+e3PyDXCnCTY8XM7csiWx/wAc8fkcSoycpI//ACtLzj/+wLpUSQe7qG1xhzKGj0z/APkswb5aIkjnk/8AxAfkRdecdXSM2oGKIJQ8hrVEDrc8KIFdcnxSmznpOH4pQH3Y/wDwcJu8XzTA4xMsb/8AntU/N/VM3wabEQbT/PN4eOXFkvcQfLQnMDFgEecH/wCUJccmlUg+T/8AYCYgwF3q5Ag9z+qOQssS8+//AMhOqFRPiiTGsf2+WgBAZ6//ABkTkMfF2Y/PeVAp/lFQAAch6J792Cd0YrgTzTJMUPx/+IcIZMjSPSGZ9PP/AOe/8hnhReIpWCzzGx5fmmCR2592dI3g9xUHojIAgz+aoGSRSEkeaf8A5WZ7D/8AjUBfH/65/aUYRL+f/f8A8KScDHMPH/4MI4lH7sUzTBeyyPD/APkwLGEHxQTgAA+a0UKswzBFCIGvPv8A/FJGUgrDFCaDDYf/AM9rk3yoimdlLJEHYUqks9v5sgSJKAPL74qid5POuP1SSUgJg580/wDyuC9D/wDHuPJ//XMekIx7oRDljkMMdfqgoHTB1v8AyZfAdtmvhzlpZSHinAofDijJn/EAjx4s4gceEm+lHMR/+URwXuBK0ChGCiR5/wDwrTU2JTKM6VO1DpfdY0As+vV0H/4DBJNAsSf6/wDxSkhjmGw5CeY/42YHtSJzUgV4oDQATCYn9XocSx+awoMAAVfqsMgBZFCZ4KqAbiSQ34rkPk//ACu85Nozv/4jXwP/ANXR5me4K/8Awfqq4Hpz/wDkILESn6sxEkxnxN3kDjAz+aIVvIv8WWsLCayoq8qtAEhiO8NOQSZB1ZA4nBcM+V/VOUQ+f/xIElCf3T/8LWeHoYpkzsen/wCBUoB23g8VwjrzVriDw8VNYUHAmgHrT8t0nkKsVFRnoXzWUZkkO29PDgEzZyjH4/8AwkgXRkdXSKsQD/nmwpUrlqRTEJh/5H5fk0LGiJeavNXpJugxEqx42kY4hjBnmwaeW8px21JJh7mJ+65//Ik1SYkqTzevtR/+FY5p5PKz/wDqnKI5KLY9gfP6sECGFGrUIxyvBQgGJ4TiwSTpOc5QFmKXCfdbCKGo8VcWAOLDP7saxzuf+2FhExEdP3chBQ88vnaiPk/4YS14DluE4MeTus1EqQLjtmI0LDPJ8Xh+qpMD7/FlXl6pSMEDm4Dr7qlLys1sJ39NlZJJIMWuft/n/s3PNIZRfLMH3Z2X63D4owb+ybwLvY8n/wCBubEuJfGWZKrk+/8Ayf8AgeUHCOM7blABBdPx/wA0x4PXFDsmXCScr0fD+KCHmqM74+LiEjiX9OKsEPxiygCIwoAM0dvj/wDANhnhG7XIQGiQ0AEPLkakSn4sCMDBOPbU0jwqRy8v5oIhw87R4IgjMFcl9v5oMCVDp58XoVL0GdFB4g7mXARCKRPG/wDJjni8EDeN5owQN43mgBETyWExJPzYgYK6viL0xjSy4/FdQwFDzvVb+H+X/wCFyB5oIP8A9UFeIOs2zunjKWGUjxHFX5VMHsqMIk0lj/dY4npuvmsINKkMS3JEOT/Kgsow5OaIaT4ihSQy54UUQPtb5qmCB8tpIHSP3WrBokXScKxeZVlk8WVe1Bn1n4bn0iWOFEfDXl3/AKVSEBdl4rIgSwwEeh/dckeZ2hDOSrIdDo1flf5/6kAAmXRYyBBMtLzKexvIM+Cqh927ZaOI0NKQedY8fmyJn/GnNjhBGFeeztMe/FlChID4q6ibhSCgOgM/2ricvAOPk/ulHYSPh5++f+TUES0AeaOjxGKRTjDXGLl7c5Z0BDgfj/kXAT5vOkkkdzSIOP8AyM95DypYsJIOzqrSiWJCIn/yqSBHis5U3Xg9zd06uXz/AMaCFKCJogCKTJzFEo5REENkHUyzPTNnILtSWwMTKHpnY1hRg8sv/K1BQJyz3UCUBX4MZFhSgH92OZieQ6qFQHl5HxUY9DY6p0RZbzJHND2sn/ypCAhxvH/AENJI+r5sz/wDDXwXmeT9U/8A1Quyo+ynQGb6sh190uMEZ5WarMqC8UG0flUYQxktEBCvMNOA0YDzUHB6rimfEhfN7VObzDD3HNDISmmLPjngyd6uAwA0HJSQN8sGs0Rr8EXzKTKSJP8A7f8AH81ZukOXTID8kOfzeRU9B9/FLAydQmhVGeo/msIsZE9Tv5swIAwVs3Z+avbRr0PLSSb8lfNnAcTPT3VwuUkZWcF2cr+rAiLwybPqyEhiNxWQlC9Pb3SSGVOf46oiCOf8OgqpGJr0eaCp4Ecbt50TCZYzIAI2RE1wz5K/42qYcU8HiP7uSFmQV4rVl0LxmtIyB6AXmIiER93hs5HuOKMXgT6/4yCJ4pLpF58WOHfA4yyKHyKE1pwGVBy+PgsokNEWJS8FFZ1/qoaHkmIKkZMEwmT6/wCNTJDDLiyhEvFkock58lmqsrTYixiT/VUkVy6x91B19os/mx76NZ/dSEqUCUnzNgbyzyePmlZIBzLJdKRpAOlPFfyChwTDHc2YCXE7fNAAR77/AOpPNj1J8NfJPuhwR/8Aqrf/AMQfA+iwBxQ1RE+G86FRAft24wr8KuFecYyk5HfSbNMZBA+6SDm5jlQ+R4VVuT+WiiwHCFh2qWZpZojBHoosCY618TR407OH4pO/MCwgAOJqwoTqQj6s8J4gz4190mBpRHE+qIg1WV7WpOhmZGiKBcIvBef9t8H5a01Jzt1Jp47oc7rmkBCSVjdj5cqagAeT/wBq8jfc1UBygmc1bJubLM0bgGSGPzWh61eClBMnV5aNgxF9sUUvBDqgEwF7TZIxJVFyukQIS9tXqAcigEnhCah4OBp+qGREJce6cFH4j8V5HD45SiUQtY1RXYEQgHRY0I7+WqwEA4OX5aAAgp/zbEch8TQJ4/HFMB4yNUTLJAqAOB0LyVCZUM+rMyz+Af1ZFxKHGXSS9h4oCAJ4Sg8A+KtyGkokxwx/xJkERq3/AC2gyyckcP8A+so92Pf/AHzZ92YLt31d9WH1Tj/kTUrgb3TgvH/hwmzTbMT3/wAI/wCnBmYmxWe7oQCPVAggOD/8LzzeW/8A4MPFUv8Aw5aYNOCv/wCOCIjPFTL8RQjn/nFJn1Xlu0nMvCzz/d8cWZ7/ABeBVFASy+//AMT6u3h3/wDW0DYPFh/+RGlXVn4q6aJMunN5iawdyzVmo88UIM//ADXl8dXk/H/4Vhamm3tZFQ04/wCJ4u5/w/8Awp3Taf8AeT80jzQntvGrC/qrpu/F+14H/wCxTkp4svksmF/4g82HjigvFE5/6sWaP/5WaW//AIYDxYv9K4oP/wAMWP8A8lvJ8/8ABPP/ACTwvEX7p/8AsVyWHxeL/wDBH/4Hkp/+Usm+BpvKiP8A+J5K8c//AKBzXXxYJ9f8uV2Tm+vfmn/7FcL8Te3/AOQlEOf/AMhsLpxxXHmnZdr8Gef/AMXT5qAP/wCgc1ElZR9f8uN+yhppPr/89Q5b6H5sPT/9dZ4udOqcf/oDPV+FR7i9Y2N/1/whSX/4eP3Xr5//AEDmvFcfL/k8NfdImU/Nh6f83zfix6/BZdW9z82fB+b8ajz/AAvp/i+5+LL/ANLDv8l9f5b619T8UB0fix/+ueFmnH/6C/CyeW8ELa4R3Yjbx1lg8NgcJ/8AgcljT5//ACwEtm4X230/zfjUeYpmz+L7n0Vsmwxzy83zy/LU35UnB+LDoPx/yLFix/8AsK2D7/8A0OTC9zYmuZPeVdNfDGi8J9lP+wyb2cTP/wCXmTwO0/5FioqCx4WXZ+7w3/h0ih/+xbSZhp/+hAKlEF453wc1Tzz/APig8f8A5b/zROEfDfT898VPR/FjzXyX41/jb5vovt+Kx9/j/m9Kw8n5s/8A7EHL/wDRhPzTj/8AT4PR+L6V9d8U/m+n574lf8JYHf4XHS+7/hb5vouOfxX1fhT/AN19Kw8n5sz/APrrk/8A2DioPIfivjf83//Z';
