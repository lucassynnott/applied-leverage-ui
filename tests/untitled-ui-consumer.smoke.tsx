import { Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoadingIndicator } from '@applied-leverage/ui/untitled-ui/components/application/loading-indicator/loading-indicator';
import { Badge } from '@applied-leverage/ui/untitled-ui/components/base/badges/badges';
import { Dot } from '@applied-leverage/ui/untitled-ui/components/foundations/dot-icon';
import { BackgroundPattern } from '@applied-leverage/ui/untitled-ui/components/shared-assets/background-patterns/index';

export const markup = renderToStaticMarkup(
  <Fragment>
    <LoadingIndicator label="Loading catalog" />
    <Badge>Open source</Badge>
    <Dot aria-label="Foundation dot" />
    <BackgroundPattern pattern="grid" aria-label="Shared background" />
  </Fragment>,
);
