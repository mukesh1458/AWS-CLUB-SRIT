import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeTransition = trigger('routeTransition', [
    transition('* <=> *', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%', top: 0, left: 0 }), { optional: true }),
        group([
            query(':enter', [
                style({ opacity: 0, transform: 'translateY(15px)' }),
                animate('0.4s 0.2s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ], { optional: true }),
            query(':leave', [
                animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(-15px)' }))
            ], { optional: true }),
        ])
    ])
]);
