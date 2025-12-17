'use client';

import { memo } from 'react';
import { AddReposButton } from './AddReposButton';

const NoRepoScreen = memo(() => {
  return (
    <div className="min-h-screen text-gray-200">
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black mb-2">No Installation Found !</h1>
          </div>
          <AddReposButton />
        </div>
      </div>

      <div className="px-8 py-16">
        <div className="max-w-3xl mx-auto  rounded-lg bg-gray-100 p-12">
          <div className="text-center space-y-6">
            <h2 className="text-xl text-black font-medium">
              CodeArc currently doesn&apos;t have access to repositories for this account.
            </h2>

            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
              Install CodeArc on your GitHub account and grant access to
              <br />
              the repositories you want to work with.
            </p>

            <div className="pt-2">
              <AddReposButton/>
            </div>

            <p className="text-gray-500 text-sm pt-4">
              Not seeing the right organization or account? You can switch by
              <br />
              selecting a different one from the dropdown in the top-left corner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

NoRepoScreen.displayName = 'NoRepoScreen';

export default NoRepoScreen;
