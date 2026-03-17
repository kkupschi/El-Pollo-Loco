import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/landing-page/landing-page').then(
                (m) => m.LandingPageComponent
            ),
    },
    {
        path: 'game',
        loadComponent: () =>
            import('./components/game-canvas/game-canvas').then(
                (m) => m.GameCanvasComponent
            ),
    },
    {
        path: 'impressum',
        loadComponent: () =>
            import('./components/impressum/impressum').then(
                (m) => m.ImpressumComponent
            ),
    },
    {
        path: '**',
        redirectTo: '',
    },
];