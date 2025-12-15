'use client';

import { memo } from 'react';
import { AddReposButton } from './AddReposButton';

const Header = memo(() => {
  return (
    <div className="flex justify-between mb-4">
      <h6 className="text-2xl font-semibold">Repositories</h6>
      <AddReposButton />
    </div>
  );
});

Header.displayName = 'RepositoriesListHeader';

export default Header;
