import {Component} from '@angular/core';
import html2canvas from 'html2canvas';
import * as ch from 'chance';
import * as $ from 'src/assets/js/jquery-with-easing';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private static canvasCount = 15;
  private static imageDataArray = [];
  title = 'angular-thanos';

  static appendElement(a, b) {
    // tslint:disable-next-line:no-unused-expression
    b.parentNode && b.parentNode.insertBefore(a, b);
  }

  static weightedRandomDistrib(peak) {
    const chance = new ch.Chance();
    const prob = [];
    const seq = [];
    for (let i = 0; i < AppComponent.canvasCount; i++) {
      prob.push(Math.pow(AppComponent.canvasCount - Math.abs(peak - i), 3));
      seq.push(i);
    }
    return chance.weighted(seq, prob);
  }

  static createBlankImageData(imageData) {
    for (let i = 0; i < AppComponent.canvasCount; i++) {
      const arr = new Uint8ClampedArray(imageData.data);
      for (let j = 0; j < arr.length; j++) {
        arr[j] = 0;
      }
      AppComponent.imageDataArray.push(arr);
    }
  }

  static newCanvasFromImageData(imageDataArray, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const tempCtx = canvas.getContext('2d');
    tempCtx.putImageData(new ImageData(imageDataArray, w, h), 0, 0);
    canvas.style.position = 'absolute';
    return canvas;
  }

  static animateBlur(elem, radius, duration) {
    $({rad: 0}).animate({rad: radius}, {
      duration,
      step(now) {
        elem.css({
          filter: 'blur(' + now + 'px)'
        });
      }
    });
  }

  static animateTransform(elem, sx, sy, angle, duration) {
    let td = 0;
    let tx = 0;
    let ty = 0;
    $({x: 0, y: 0, deg: 0}).animate({x: sx, y: sy, deg: angle}, {
      duration,
      step(now, fx) {
        if (fx.prop === 'x') {
          tx = now;
        } else if (fx.prop === 'y') {
          ty = now;
        } else if (fx.prop === 'deg') {
          td = now;
        }
        elem.css({
          transform: 'rotate(' + td + 'deg)' + 'translate(' + tx + 'px,' + ty + 'px)'
        });
      }
    });
  }

  animateEffect() {
    // this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
    const toDestroyIndexs = new Set();
    AppComponent.imageDataArray = [];
    const elementsByTagName = $('div').not('.destroyed');
    const num = 1;
    for (let index = 0; index < num; index++) {
      let elementIndex;
      do {
        elementIndex = Math.floor(Math.random() * Math.floor(elementsByTagName.length));
      } while (toDestroyIndexs.has(elementIndex));
      toDestroyIndexs.add(elementIndex);
    }

    toDestroyIndexs.forEach(index => {
      const element = elementsByTagName[index];
      html2canvas(element).then(canvas => {
        const context2D = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imgData = context2D.getImageData(0, 0, width, height);
        const pixelArr = imgData.data;
        AppComponent.createBlankImageData(imgData);
        /*TODO: Very heavy process Optimize it*/
        for (let i = 0; i < pixelArr.length; i += 4) {
          // find the highest probability canvas the pixel should be in
          const p = Math.floor((i / pixelArr.length) * AppComponent.canvasCount);
          const a = AppComponent.imageDataArray[AppComponent.weightedRandomDistrib(p)];
          a[i] = pixelArr[i];
          a[i + 1] = pixelArr[i + 1];
          a[i + 2] = pixelArr[i + 2];
          a[i + 3] = pixelArr[i + 3];
        }
        element.style.animation = 'ease-out';
        element.style.opacity = '0';
        element.classList.add('destroyed');
        // create canvas for each imageData and append to target element
        for (let i = 0; i < AppComponent.canvasCount; i++) {
          const c = AppComponent.newCanvasFromImageData(AppComponent.imageDataArray[i], width, height);
          c.classList.add('dust');
          AppComponent.appendElement(c, element);
        }
        const chance = new ch.Chance();
        $('.dust').each(function(indx) {
          AppComponent.animateBlur($(this), 0.8, 800);
          setTimeout(() => {
            AppComponent.animateTransform($(this), 100, -100, chance.integer({min: -15, max: 15}), 800 + (110 * indx));
          }, 70 * indx);
          // remove the canvas from DOM tree when faded
          $(this).delay(70 * indx).fadeOut((110 * indx) + 800, 'easeInQuint', () => {
            $(this).remove();
          });
        });
      });
    });
  }
}
