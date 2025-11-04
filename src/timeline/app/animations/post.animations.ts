import {
  trigger,
  transition,
  style,
  animate,
  state,
  keyframes
} from '@angular/animations';

/**
 * Animação do coração quando o usuário curte um post
 */
export const heartBeatAnimation = trigger('heartBeat', [
  state('inactive', style({ transform: 'scale(1)' })),
  state('active', style({ transform: 'scale(1)' })),
  transition('inactive => active', [
    animate('0.3s', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.3)', offset: 0.14 }),
      style({ transform: 'scale(1)', offset: 0.28 }),
      style({ transform: 'scale(1.3)', offset: 0.42 }),
      style({ transform: 'scale(1)', offset: 0.70 })
    ]))
  ])
]);

/**
 * Animação do contador de likes quando muda o número
 */
export const likeAnimation = trigger('likeAnimation', [
  transition('* => *', [
    animate('0.3s', keyframes([
      style({ transform: 'scale(1)', color: '#000000', offset: 0 }),
      style({ transform: 'scale(1.5)', color: '#e74c3c', offset: 0.3 }),
      style({ transform: 'scale(0.85)', color: '#e74c3c', offset: 0.5 }),
      style({ transform: 'scale(1.1)', color: '#e74c3c', offset: 0.7 }),
      style({ transform: 'scale(1)', color: '#e74c3c', offset: 1.0 })
    ]))
  ])
]);

/**
 * Animação de entrada quando um novo post é publicado
 */
export const publishAnimation = trigger('publishAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-20px)' }),
    animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);
