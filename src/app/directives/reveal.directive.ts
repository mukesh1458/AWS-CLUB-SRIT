import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appReveal]',
    standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
    private observer: IntersectionObserver | null = null;

    constructor(private el: ElementRef) {
        this.el.nativeElement.classList.add('reveal');
    }

    ngAfterViewInit() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.el.nativeElement.classList.add('visible');
                    if (this.observer) {
                        this.observer.unobserve(this.el.nativeElement);
                    }
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        this.observer.observe(this.el.nativeElement);
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
