import {Component} from '@angular/core';
import html2canvas from 'html2canvas';
import * as ch from "chance";
import * as $ from "jquery";


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
    b.parentNode && b.parentNode.insertBefore(a, b)
  }

  static weightedRandomDistrib(peak) {
    let chance = new ch.Chance();
    let prob = [], seq = [];
    for (let i = 0; i < AppComponent.canvasCount; i++) {
      prob.push(Math.pow(AppComponent.canvasCount - Math.abs(peak - i), 3));
      seq.push(i);
    }
    return chance.weighted(seq, prob);
  }

  static createBlankImageData(imageData) {
    for (let i = 0; i < AppComponent.canvasCount; i++) {
      let arr = new Uint8ClampedArray(imageData.data);
      for (let j = 0; j < arr.length; j++) {
        arr[j] = 0;
      }
      AppComponent.imageDataArray.push(arr);
    }
  }

  static newCanvasFromImageData(imageDataArray, w, h) {
    let canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    let tempCtx = canvas.getContext("2d");
    tempCtx.putImageData(new ImageData(imageDataArray, w, h), 0, 0);
    canvas.style.position = "absolute";
    return canvas;
  }

  static animateBlur(elem, radius, duration) {
    $({rad: 0}).animate({rad: radius}, {
      duration: duration,
      step: function (now) {
        elem.css({
          filter: 'blur(' + now + 'px)'
        });
      }
    });
  }

  static animateTransform(elem, sx, sy, angle, duration) {
    let td = 0, tx = 0, ty = 0;
    $({x: 0, y: 0, deg: 0}).animate({x: sx, y: sy, deg: angle}, {
      duration: duration,
      step: function (now, fx) {
        if (fx.prop == "x")
          tx = now;
        else if (fx.prop == "y")
          ty = now;
        else if (fx.prop == "deg")
          td = now;
        elem.css({
          transform: 'rotate(' + td + 'deg)' + 'translate(' + tx + 'px,' + ty + 'px)'
        });
      }
    });
  }

  animateEffect() {
    //this.currentState = this.currentState === 'initial' ? 'final' : 'initial';
    let toDestroyIndexs = new Set();
    AppComponent.imageDataArray = [];
    let elementsByTagName = $("div").not(".destroyed");
    let number = 1;
    for (let index = 0; index < number; index++) {
      let elementIndex = undefined;
      do {
        elementIndex = Math.floor(Math.random() * Math.floor(elementsByTagName.length));
      } while (toDestroyIndexs.has(elementIndex));
      toDestroyIndexs.add(elementIndex);
    }

    toDestroyIndexs.forEach(index => {
      let element = elementsByTagName[index];
      html2canvas(element).then(function (canvas) {
        let context2D = canvas.getContext("2d");
        let width = canvas.width;
        let height = canvas.height;
        let imgData = context2D.getImageData(0, 0, width, height);
        let pixelArr = imgData.data;
        AppComponent.createBlankImageData(imgData);
        /*TODO: Very heavy process Optimize it*/
        for (let i = 0; i < pixelArr.length; i += 8) {
          //find the highest probability canvas the pixel should be in
          let p = Math.floor((i / pixelArr.length) * AppComponent.canvasCount);
          let a = AppComponent.imageDataArray[AppComponent.weightedRandomDistrib(p)];
          a[i] = pixelArr[i];
          a[i + 1] = pixelArr[i + 1];
          a[i + 2] = pixelArr[i + 2];
          a[i + 3] = pixelArr[i + 3];
        }
        element.style.animation = "ease-out";
        element.style.opacity = "0";
        element.classList.add("destroyed");
        //create canvas for each imageData and append to target element
        for (let i = 0; i < AppComponent.canvasCount; i++) {
          let c = AppComponent.newCanvasFromImageData(AppComponent.imageDataArray[i], width, height);
          c.classList.add("dust");
          AppComponent.appendElement(c, element);
        }
        let chance = new ch.Chance();
        $(".dust").each(function (index) {
          AppComponent.animateBlur($(this), 0.8, 800);
          setTimeout(() => {
            AppComponent.animateTransform($(this), 100, -100, chance.integer({min: -15, max: 15}), 800 + (110 * index));
          }, 70 * index);
          //remove the canvas from DOM tree when faded
          $(this).delay(70 * index).fadeOut((110 * index) + 800, "easeInQuint", () => {
            $(this).remove();
          });
        });
      });
    });
  }
}
