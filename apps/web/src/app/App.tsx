import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SessionProvider } from './context/SessionContext';
import { InteractionProvider } from './context/InteractionContext';
import { PetsProvider } from './context/PetsContext';
import { HealthProvider } from './context/HealthContext';
import { ReviewsProvider } from './context/ReviewsContext';

export default function App() {
  return (
    <SessionProvider>
      <InteractionProvider>
        <PetsProvider>
          <ReviewsProvider>
            <HealthProvider>
              <div className="size-full">
                <RouterProvider router={router} />
              </div>
            </HealthProvider>
          </ReviewsProvider>
        </PetsProvider>
      </InteractionProvider>
    </SessionProvider>
  );
}
