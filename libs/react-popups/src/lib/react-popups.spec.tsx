import { render } from '@testing-library/react';

import ReactPopups from './react-popups';

describe('ReactPopups', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactPopups />);
    expect(baseElement).toBeTruthy();
  });
});
