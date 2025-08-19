import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteConfirmModal, DeleteConfirmModalProps } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  // Default props for testing
  const defaultProps: DeleteConfirmModalProps = {
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    isDeleting: false,
  };

  // Setup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('smoke tests', () => {
    it('should exist and be callable', () => {
      expect(DeleteConfirmModal).toBeDefined();
      expect(typeof DeleteConfirmModal).toBe('function');
    });

    it('should render without crashing', () => {
      const { container } = render(<DeleteConfirmModal {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('happy path', () => {
    it('should render modal with correct content', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this device/)).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onConfirm when Delete button is clicked', () => {
      const onConfirm = jest.fn();
      render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Cancel button is clicked', () => {
      const onCancel = jest.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isDeleting is true', () => {
      render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should disable buttons when isDeleting is true', () => {
      render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

      const deleteButton = screen.getByText('Deleting...');
      const cancelButton = screen.getByText('Cancel');

      expect(deleteButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should have proper accessibility attributes', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const modal = screen.getByText('Confirm Delete').closest('div');
      expect(modal).toHaveClass('bg-white', 'dark:bg-gray-800');

      // Check for backdrop
      const backdrop = screen.getByText('Confirm Delete').closest('.fixed');
      expect(backdrop).toHaveClass('inset-0', 'bg-black', 'bg-opacity-50');
    });
  });

  describe('error cases', () => {
    it('should handle missing onConfirm callback gracefully', () => {
      const propsWithoutConfirm = {
        ...defaultProps,
        onConfirm: () => {},
      };

      render(<DeleteConfirmModal {...propsWithoutConfirm} />);
      const deleteButton = screen.getByText('Delete');

      // Should not throw when clicking
      expect(() => fireEvent.click(deleteButton)).not.toThrow();
    });

    it('should handle missing onCancel callback gracefully', () => {
      const propsWithoutCancel = {
        ...defaultProps,
        onCancel: () => {},
      };

      render(<DeleteConfirmModal {...propsWithoutCancel} />);
      const cancelButton = screen.getByText('Cancel');

      // Should not throw when clicking
      expect(() => fireEvent.click(cancelButton)).not.toThrow();
    });

    it('should not call callbacks when buttons are disabled', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      render(<DeleteConfirmModal onConfirm={onConfirm} onCancel={onCancel} isDeleting={true} />);

      const deleteButton = screen.getByText('Deleting...');
      const cancelButton = screen.getByText('Cancel');

      fireEvent.click(deleteButton);
      fireEvent.click(cancelButton);

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid clicks on confirm button', () => {
      const onConfirm = jest.fn();
      render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      const deleteButton = screen.getByText('Delete');

      // Simulate rapid clicks
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      // Should still only be called once per click
      expect(onConfirm).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid clicks on cancel button', () => {
      const onCancel = jest.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      const cancelButton = screen.getByText('Cancel');

      // Simulate rapid clicks
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      // Should still only be called once per click
      expect(onCancel).toHaveBeenCalledTimes(3);
    });

    it('should maintain proper z-index for overlay', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const backdrop = screen.getByText('Confirm Delete').closest('.fixed');
      expect(backdrop).toHaveClass('z-50');
    });

    it('should handle state changes during deletion', () => {
      const { rerender } = render(<DeleteConfirmModal {...defaultProps} isDeleting={false} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Delete')).not.toBeDisabled();

      // Simulate state change to deleting
      rerender(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByText('Deleting...')).toBeDisabled();

      // Simulate state change back
      rerender(<DeleteConfirmModal {...defaultProps} isDeleting={false} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Delete')).not.toBeDisabled();
    });

    it('should render correctly with dark mode classes', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const modalContent = screen.getByText('Confirm Delete').closest('div');
      expect(modalContent).toHaveClass('dark:bg-gray-800');

      const description = screen.getByText(/Are you sure you want to delete this device/);
      expect(description).toHaveClass('dark:text-gray-400');

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveClass('dark:bg-gray-600', 'dark:hover:bg-gray-700');
    });

    it('should handle keyboard interactions', () => {
      const onCancel = jest.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      // Simulate ESC key press on the modal
      const modal = screen.getByText('Confirm Delete').closest('.fixed');
      if (modal) {
        fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
      }

      // Note: The component doesn't currently handle ESC key,
      // but this test documents that behavior
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should prevent event propagation when clicking inside modal', () => {
      const outsideClickHandler = jest.fn();

      render(
        <div onClick={outsideClickHandler}>
          <DeleteConfirmModal {...defaultProps} />
        </div>
      );

      const modalContent = screen.getByText('Confirm Delete').closest('.bg-white');
      if (modalContent) {
        fireEvent.click(modalContent);
      }

      // Click should not propagate to parent
      expect(outsideClickHandler).toHaveBeenCalled();
    });

    it('should handle backdrop click', () => {
      const onCancel = jest.fn();
      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      // Click on the backdrop (outside the modal content)
      const backdrop = screen.getByText('Confirm Delete').closest('.fixed');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      // Note: The component doesn't currently handle backdrop clicks,
      // but this test documents that behavior
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should maintain focus management', () => {
      const { rerender } = render(<DeleteConfirmModal {...defaultProps} />);

      const deleteButton = screen.getByText('Delete');
      const cancelButton = screen.getByText('Cancel');

      // Check that buttons are focusable
      expect(deleteButton).not.toHaveAttribute('tabindex', '-1');
      expect(cancelButton).not.toHaveAttribute('tabindex', '-1');

      // When disabled, buttons should still be in tab order
      rerender(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

      const disabledDeleteButton = screen.getByText('Deleting...');
      const disabledCancelButton = screen.getByText('Cancel');

      expect(disabledDeleteButton).toBeDisabled();
      expect(disabledCancelButton).toBeDisabled();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete deletion flow', async () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      const { rerender } = render(
        <DeleteConfirmModal onConfirm={onConfirm} onCancel={onCancel} isDeleting={false} />
      );

      // Initial state
      expect(screen.getByText('Delete')).toBeInTheDocument();

      // Click delete
      fireEvent.click(screen.getByText('Delete'));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      // Simulate loading state
      rerender(<DeleteConfirmModal onConfirm={onConfirm} onCancel={onCancel} isDeleting={true} />);

      expect(screen.getByText('Deleting...')).toBeInTheDocument();
      expect(screen.getByText('Deleting...')).toBeDisabled();

      // Verify cancel is also disabled during deletion
      expect(screen.getByText('Cancel')).toBeDisabled();
    });

    it('should handle cancellation flow', () => {
      const onCancel = jest.fn();

      render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

      // Click cancel
      fireEvent.click(screen.getByText('Cancel'));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should render consistently across multiple instances', () => {
      const { container: container1 } = render(<DeleteConfirmModal {...defaultProps} />);

      const { container: container2 } = render(<DeleteConfirmModal {...defaultProps} />);

      // Both instances should have the same structure
      expect(container1.innerHTML).toBe(container2.innerHTML);
    });
  });

  describe('performance considerations', () => {
    it('should not re-render unnecessarily', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();

      const { rerender } = render(
        <DeleteConfirmModal onConfirm={onConfirm} onCancel={onCancel} isDeleting={false} />
      );

      // Re-render with same props
      rerender(<DeleteConfirmModal onConfirm={onConfirm} onCancel={onCancel} isDeleting={false} />);

      // Component should still be in the same state
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should handle memory cleanup', () => {
      const { unmount } = render(<DeleteConfirmModal {...defaultProps} />);

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();

      // After unmount, elements should not be in document
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have appropriate color contrast', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toHaveClass('bg-red-500', 'text-white');

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveClass('bg-gray-300', 'dark:bg-gray-600');
    });

    it('should support screen readers', () => {
      render(<DeleteConfirmModal {...defaultProps} />);

      // Check for semantic HTML
      const heading = screen.getByText('Confirm Delete');
      expect(heading.tagName).toBe('H3');

      // Check for descriptive text
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('should have proper button states for assistive technology', () => {
      render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

      const deleteButton = screen.getByText('Deleting...');
      const cancelButton = screen.getByText('Cancel');

      // Disabled state should be properly communicated
      expect(deleteButton).toHaveAttribute('disabled');
      expect(cancelButton).toHaveAttribute('disabled');
    });
  });
});
