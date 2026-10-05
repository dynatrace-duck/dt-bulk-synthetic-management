import {
  PageLayout,
  AppHeader,
} from '@dynatrace/strato-components/layouts';
import React from 'react';
import {
  Route,
  Routes,
  Link,
} from 'react-router-dom';
import { HostList } from './pages/HostList';

export const App = () => {
  return (
    <PageLayout>
      <PageLayout.Header>
        <AppHeader>
          <AppHeader.Navigation>
            <AppHeader.Logo as={Link} to="/" />
          </AppHeader.Navigation>
        </AppHeader>
      </PageLayout.Header>
      <PageLayout.Content>
        <Routes>
          <Route path="/" element={<HostList />} />
        </Routes>
      </PageLayout.Content>
    </PageLayout>
  );
};