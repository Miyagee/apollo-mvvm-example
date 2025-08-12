import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmModal, DeleteConfirmModalProps } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const defaultProps: DeleteConfirmModalProps = {
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    isDeleting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given a delete confirmation modal', () => {
    describe('When the modal is rendered', () => {
      it('Then it should display the confirmation message and action buttons', () => {
        render(<DeleteConfirmModal {...defaultProps} />);

        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete this device/)).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    describe('When the user clicks the Delete button', () => {
      it('Then it should trigger the onConfirm callback', () => {
        const onConfirm = jest.fn();
        render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);

        fireEvent.click(screen.getByText('Delete'));

        expect(onConfirm).toHaveBeenCalledTimes(1);
      });
    });

    describe('When the user clicks the Cancel button', () => {
      it('Then it should trigger the onCancel callback', () => {
        const onCancel = jest.fn();
        render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

        fireEvent.click(screen.getByText('Cancel'));

        expect(onCancel).toHaveBeenCalledTimes(1);
      });
    });

    describe('When deletion is in progress', () => {
      it('Then it should show loading state and disable both buttons', () => {
        render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

        expect(screen.getByText('Deleting...')).toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
        expect(screen.getByText('Deleting...')).toBeDisabled();
        expect(screen.getByText('Cancel')).toBeDisabled();
      });

      it('Then it should not trigger callbacks when buttons are clicked', () => {
        const onConfirm = jest.fn();
        const onCancel = jest.fn();

        render(<DeleteConfirmModal onConfirm={onConfirm} onCancel={onCancel} isDeleting={true} />);

        fireEvent.click(screen.getByText('Deleting...'));
        fireEvent.click(screen.getByText('Cancel'));

        expect(onConfirm).not.toHaveBeenCalled();
        expect(onCancel).not.toHaveBeenCalled();
      });
    });

    describe('When the ESC key is pressed', () => {
      it('Then it should trigger the onCancel callback', () => {
        const onCancel = jest.fn();
        render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

        expect(onCancel).toHaveBeenCalledTimes(1);
      });
    });

    describe('When the modal state changes from active to deleting', () => {
      it('Then it should transition from enabled to disabled state correctly', () => {
        const { rerender } = render(<DeleteConfirmModal {...defaultProps} isDeleting={false} />);

        expect(screen.getByText('Delete')).not.toBeDisabled();
        expect(screen.getByText('Cancel')).not.toBeDisabled();

        rerender(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

        expect(screen.getByText('Deleting...')).toBeDisabled();
        expect(screen.getByText('Cancel')).toBeDisabled();

        rerender(<DeleteConfirmModal {...defaultProps} isDeleting={false} />);

        expect(screen.getByText('Delete')).not.toBeDisabled();
        expect(screen.getByText('Cancel')).not.toBeDisabled();
      });
    });

    describe('When the user rapidly clicks action buttons', () => {
      it('Then it should handle multiple confirm clicks appropriately', () => {
        const onConfirm = jest.fn();
        render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
        fireEvent.click(deleteButton);
        fireEvent.click(deleteButton);

        expect(onConfirm).toHaveBeenCalledTimes(3);
      });

      it('Then it should handle multiple cancel clicks appropriately', () => {
        const onCancel = jest.fn();
        render(<DeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        fireEvent.click(cancelButton);
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalledTimes(3);
      });
    });

    describe('When checking accessibility features', () => {
      it('Then it should have proper semantic HTML structure', () => {
        render(<DeleteConfirmModal {...defaultProps} />);

        const heading = screen.getByText('Confirm Delete');
        expect(heading.tagName).toBe('H3');
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      });

      it('Then it should have appropriate color contrast for buttons', () => {
        render(<DeleteConfirmModal {...defaultProps} />);

        const deleteButton = screen.getByText('Delete');
        expect(deleteButton).toHaveClass('bg-red-500', 'text-white');

        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toHaveClass('bg-gray-300');
      });

      it('Then it should properly communicate disabled state to assistive technology', () => {
        render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

        expect(screen.getByText('Deleting...')).toHaveAttribute('disabled');
        expect(screen.getByText('Cancel')).toHaveAttribute('disabled');
      });
    });

    describe('When the component unmounts', () => {
      it('Then it should clean up without errors', () => {
        const { unmount } = render(<DeleteConfirmModal {...defaultProps} />);

        expect(() => unmount()).not.toThrow();
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
    });
  });
});
