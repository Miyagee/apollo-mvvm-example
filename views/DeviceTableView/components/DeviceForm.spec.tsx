import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceForm, DeviceFormProps } from './DeviceForm';
import {
  Device,
  DeviceType,
  DeviceStatus,
  CreateDeviceInput,
  UpdateDeviceInput,
} from '@/graphql/generated';
import { DeviceModel } from '@/models/Device';

// Spy on the static methods instead of mocking the entire module
const isValidNameSpy = jest.spyOn(DeviceModel, 'isValidName');
const isValidSerialNumberSpy = jest.spyOn(DeviceModel, 'isValidSerialNumber');
const isValidFirmwareVersionSpy = jest.spyOn(DeviceModel, 'isValidFirmwareVersion');

describe('DeviceForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps: DeviceFormProps = {
    device: null,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false,
  };

  // Create a mock Device data object that matches the GraphQL Device type
  const mockDeviceData: Device = {
    id: '1',
    name: 'Test Device',
    serialNumber: 'TD-001-A',
    type: DeviceType.Sensor,
    status: DeviceStatus.Online,
    firmwareVersion: '1.0.0',
    location: 'Lab 1',
    lastSeenAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  // Create a DeviceModel instance from the mock data
  const mockDevice = new DeviceModel(mockDeviceData);

  beforeEach(() => {
    // Reset all mocks
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
    isValidNameSpy.mockReset().mockReturnValue(true);
    isValidSerialNumberSpy.mockReset().mockReturnValue(true);
    isValidFirmwareVersionSpy.mockReset().mockReturnValue(true);
  });

  afterAll(() => {
    // Restore the original implementations
    isValidNameSpy.mockRestore();
    isValidSerialNumberSpy.mockRestore();
    isValidFirmwareVersionSpy.mockRestore();
  });

  describe('Form Rendering', () => {
    it('should render create form when no device is provided', () => {
      render(<DeviceForm {...defaultProps} />);

      expect(screen.getByText('Add New Device')).toBeInTheDocument();
      // Check that all expected form fields are present
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes).toHaveLength(4); // name, serial number, firmware version, location
      expect(screen.getByPlaceholderText('XX-000-XXX')).toBeInTheDocument(); // Serial number
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Type select
      expect(screen.getByPlaceholderText('1.0.0')).toBeInTheDocument(); // Firmware version
      expect(screen.queryByText(/status/i)).not.toBeInTheDocument();
    });

    it('should render edit form when device is provided', () => {
      render(<DeviceForm {...defaultProps} device={mockDevice} />);

      expect(screen.getByText('Edit Device')).toBeInTheDocument();
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveValue(mockDevice.name); // Name input
      expect(screen.queryByPlaceholderText('XX-000-XXX')).not.toBeInTheDocument(); // No serial number in edit
      expect(screen.queryByText(/type/i)).not.toBeInTheDocument(); // No type select in edit
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Status select
      expect(inputs[1]).toHaveValue(mockDevice.firmwareVersion); // Firmware input
      expect(inputs[2]).toHaveValue(mockDevice.location || ''); // Location input
    });

    it('should show required field indicators', () => {
      render(<DeviceForm {...defaultProps} />);

      const nameLabel = screen.getByText(/name/i);
      const serialNumberLabel = screen.getByText(/serial number/i);
      const firmwareVersionLabel = screen.getByText(/firmware version/i);

      expect(nameLabel.parentElement).toHaveTextContent('*');
      expect(serialNumberLabel.parentElement).toHaveTextContent('*');
      expect(firmwareVersionLabel.parentElement).toHaveTextContent('*');
    });

    it('should disable buttons when isSubmitting is true', () => {
      render(<DeviceForm {...defaultProps} isSubmitting={true} />);

      expect(screen.getByText('Saving...')).toBeDisabled();
      expect(screen.getByText('Cancel')).toBeDisabled();
    });

    it('should populate all device type options', () => {
      render(<DeviceForm {...defaultProps} />);

      Object.values(DeviceType).forEach((type) => {
        expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
      });
    });

    it('should populate all device status options in edit mode', () => {
      render(<DeviceForm {...defaultProps} device={mockDevice} />);

      Object.values(DeviceStatus).forEach((status) => {
        expect(screen.getByRole('option', { name: status })).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for invalid name', async () => {
      isValidNameSpy.mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const nameInput = screen.getAllByRole('textbox')[0];
      const submitButton = screen.getByText('Create');

      await userEvent.type(nameInput, 'ab');
      await userEvent.click(submitButton);

      expect(screen.getByText('Name must be between 3 and 50 characters')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation errors for invalid serial number', async () => {
      isValidSerialNumberSpy.mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
      const submitButton = screen.getByText('Create');

      await userEvent.type(serialNumberInput, 'invalid');
      await userEvent.click(submitButton);

      expect(screen.getByText('Format: XX-000-XXX (e.g., TS-001-A)')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation errors for invalid firmware version', async () => {
      isValidFirmwareVersionSpy.mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const firmwareInput = screen.getByPlaceholderText('1.0.0');
      const submitButton = screen.getByText('Create');

      await userEvent.type(firmwareInput, 'invalid');
      await userEvent.click(submitButton);

      expect(screen.getByText('Format: X.Y.Z (e.g., 1.0.0)')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not validate serial number for edit form', async () => {
      isValidSerialNumberSpy.mockReturnValue(false);

      render(<DeviceForm {...defaultProps} device={mockDevice} />);

      const submitButton = screen.getByText('Update');
      await userEvent.click(submitButton);

      expect(DeviceModel.isValidSerialNumber).not.toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should show multiple validation errors', async () => {
      isValidNameSpy.mockReturnValue(false);
      isValidSerialNumberSpy.mockReturnValue(false);
      isValidFirmwareVersionSpy.mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const submitButton = screen.getByText('Create');
      await userEvent.click(submitButton);

      expect(screen.getByText('Name must be between 3 and 50 characters')).toBeInTheDocument();
      expect(screen.getByText('Format: XX-000-XXX (e.g., TS-001-A)')).toBeInTheDocument();
      expect(screen.getByText('Format: X.Y.Z (e.g., 1.0.0)')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit create form with correct data', async () => {
      render(<DeviceForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs[0];
      const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
      const typeSelect = screen.getByRole('combobox');
      const firmwareInput = screen.getByPlaceholderText('1.0.0');
      const locationInput = inputs[inputs.length - 1];

      await userEvent.type(nameInput, 'New Device');
      await userEvent.type(serialNumberInput, 'ND-001-A');
      await userEvent.selectOptions(typeSelect, DeviceType.Gateway);
      await userEvent.type(firmwareInput, '2.0.0');
      await userEvent.type(locationInput, 'Lab 2');

      const submitButton = screen.getByText('Create');
      await userEvent.click(submitButton);

      const expectedData: CreateDeviceInput = {
        name: 'New Device',
        serialNumber: 'ND-001-A',
        type: DeviceType.Gateway,
        firmwareVersion: '2.0.0',
        location: 'Lab 2',
      };

      expect(mockOnSubmit).toHaveBeenCalledWith(expectedData);
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should submit update form with correct data', async () => {
      render(<DeviceForm {...defaultProps} device={mockDevice} />);

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs[0];
      const statusSelect = screen.getByRole('combobox');
      const firmwareInput = inputs[1];
      const locationInput = inputs[2];

      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated Device');
      await userEvent.selectOptions(statusSelect, DeviceStatus.Offline);
      await userEvent.clear(firmwareInput);
      await userEvent.type(firmwareInput, '2.0.0');
      await userEvent.clear(locationInput);

      const submitButton = screen.getByText('Update');
      await userEvent.click(submitButton);

      const expectedData: UpdateDeviceInput = {
        id: mockDevice.id,
        name: 'Updated Device',
        status: DeviceStatus.Offline,
        firmwareVersion: '2.0.0',
        location: null,
      };

      expect(mockOnSubmit).toHaveBeenCalledWith(expectedData);
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should handle empty optional location field', async () => {
      render(<DeviceForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs[0];
      const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
      const firmwareInput = screen.getByPlaceholderText('1.0.0');

      await userEvent.type(nameInput, 'New Device');
      await userEvent.type(serialNumberInput, 'ND-001-A');
      await userEvent.type(firmwareInput, '1.0.0');

      const submitButton = screen.getByText('Create');
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          location: null,
        })
      );
    });

    it('should prevent form submission when validation fails', async () => {
      (DeviceModel.isValidName as jest.Mock).mockReturnValue(false);
      (DeviceModel.isValidSerialNumber as jest.Mock).mockReturnValue(false);
      (DeviceModel.isValidFirmwareVersion as jest.Mock).mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const submitButton = screen.getByText('Create');
      await userEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(screen.getByText('Name must be between 3 and 50 characters')).toBeInTheDocument();
      expect(screen.getByText('Format: XX-000-XXX (e.g., TS-001-A)')).toBeInTheDocument();
      expect(screen.getByText('Format: X.Y.Z (e.g., 1.0.0)')).toBeInTheDocument();
    });

    it('should handle form submission errors gracefully', async () => {
      render(<DeviceForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs[0];
      const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
      const firmwareInput = screen.getByPlaceholderText('1.0.0');

      fireEvent.change(nameInput, { target: { value: 'New Device' } });
      fireEvent.change(serialNumberInput, { target: { value: 'ND-001-A' } });
      fireEvent.change(firmwareInput, { target: { value: '1.0.0' } });

      const error = new Error('Network error');

      // Mock the rejection after render and input setup
      mockOnSubmit.mockRejectedValueOnce(error);

      // Suppress the unhandled rejection warning
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // The form should still be visible after the error
      expect(screen.getByText('Add New Device')).toBeInTheDocument();
      expect(screen.getAllByRole('textbox')).toHaveLength(4);

      // onCancel should NOT have been called because the error prevents it
      expect(mockOnCancel).not.toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('User Interactions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      render(<DeviceForm {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should update form data when inputs change', async () => {
      render(<DeviceForm {...defaultProps} />);

      const nameInput = screen.getAllByRole('textbox')[0];
      await userEvent.type(nameInput, 'Test Device');

      expect(nameInput).toHaveValue('Test Device');
    });

    it('should clear validation errors when user corrects input', async () => {
      isValidNameSpy.mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const nameInput = screen.getAllByRole('textbox')[0];
      const submitButton = screen.getByText('Create');

      // Trigger validation error
      await userEvent.type(nameInput, 'ab');
      fireEvent.click(submitButton);

      expect(
        await screen.findByText('Name must be between 3 and 50 characters')
      ).toBeInTheDocument();

      // Fix the error
      isValidNameSpy.mockReturnValue(true);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Valid Name');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Name must be between 3 and 50 characters')
        ).not.toBeInTheDocument();
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Valid Name',
          })
        );
      });
    });

    it('should handle keyboard navigation', async () => {
      render(<DeviceForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs[0];
      const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');

      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      await userEvent.tab();
      expect(document.activeElement).toBe(serialNumberInput);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const { container } = render(<DeviceForm {...defaultProps} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have inputs with proper types', () => {
      render(<DeviceForm {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should show error messages associated with fields', async () => {
      (DeviceModel.isValidName as jest.Mock).mockReturnValue(false);

      render(<DeviceForm {...defaultProps} />);

      const submitButton = screen.getByText('Create');
      await userEvent.click(submitButton);

      const errorMessage = screen.getByText('Name must be between 3 and 50 characters');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
