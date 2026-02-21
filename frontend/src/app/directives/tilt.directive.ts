import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[appTilt]',
    standalone: true
})
export class TiltDirective {
    constructor(private el: ElementRef) {
        this.el.nativeElement.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease';
        this.el.nativeElement.style.transformStyle = 'preserve-3d';
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        const card = this.el.nativeElement;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to the center of the element
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate tilt angles (multiplier controls intensity)
        const tiltX = ((y - centerY) / centerY) * -12;
        const tiltY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), ${tiltY * -1}px ${tiltX}px 30px rgba(255,153,0,0.15)`;
    }

    @HostListener('mouseleave')
    onMouseLeave() {
        const card = this.el.nativeElement;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.boxShadow = 'var(--shadow)';
    }
}
