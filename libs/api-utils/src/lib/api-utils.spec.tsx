import { render } from '@testing-library/react';

import ApiUtils from './api-utils';

describe('ApiUtils', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ApiUtils />);
    expect(baseElement).toBeTruthy();
  });
});
