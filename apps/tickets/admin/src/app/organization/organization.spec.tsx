import { render } from '@testing-library/react';

import Organization from './organization';

describe('Organization', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Organization />);
    expect(baseElement).toBeTruthy();
  });
});
