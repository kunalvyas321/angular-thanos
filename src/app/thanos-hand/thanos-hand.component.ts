import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent} from "rxjs";

@Component({
  selector: 'app-thanos-hand',
  templateUrl: './thanos-hand.component.html',
  styleUrls: ['./thanos-hand.component.scss']
})
export class ThanosHandComponent implements OnInit, AfterViewInit {

  @ViewChild("baseCanvas", {static: true})
  baseCanvas: ElementRef;

  @Output()
  startDestruction = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    let image = new Image();
    image.src = './assets/thanos_idle.png';
    fromEvent(image, 'load').subscribe(() => {
      console.log('loaded');
      let canvas: HTMLCanvasElement = this.baseCanvas.nativeElement;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
    });
  }

  animateSnap() {
    let image = new Image();
    image.src = './assets/thanos_snap.png';
    fromEvent(image, 'load').subscribe(() => {
      let canvas: HTMLCanvasElement = this.baseCanvas.nativeElement;
      let ctx = canvas.getContext("2d");
      let width = image.width;
      let min = 0 - width;
      let step = 80;
      let x = 0;
      let interval = setInterval(() => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(image, x, 0);
        ctx.drawImage(image, x + width, 0);
        x -= step;
        if (x < min) {
          x = 0;
          this.startDestruction.next();
          clearInterval(interval);
        }
      }, 50);
    });
  }
}
