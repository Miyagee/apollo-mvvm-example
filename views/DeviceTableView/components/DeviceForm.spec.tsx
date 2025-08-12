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

  describe('Given a user wants to create a new device', () => {
    describe('When the create form is displayed', () => {
      it('Then shows create form with all required fields', () => {
        render(<DeviceForm {...defaultProps} />);

        expect(screen.getByText('Add New Device')).toBeInTheDocument();
        const textboxes = screen.getAllByRole('textbox');
        expect(textboxes).toHaveLength(4); // name, serial number, firmware version, location
        expect(screen.getByPlaceholderText('XX-000-XXX')).toBeInTheDocument(); // Serial number
        expect(screen.getAllByRole('combobox')).toHaveLength(2); // Type and Status selects
        expect(screen.getByPlaceholderText('1.0.0')).toBeInTheDocument(); // Firmware version
      });

      it('Then shows required field indicators', () => {
        render(<DeviceForm {...defaultProps} />);

        const nameLabel = screen.getByText(/name/i);
        const serialNumberLabel = screen.getByText(/serial number/i);
        const firmwareVersionLabel = screen.getByText(/firmware version/i);

        expect(nameLabel.parentElement).toHaveTextContent('*');
        expect(serialNumberLabel.parentElement).toHaveTextContent('*');
        expect(firmwareVersionLabel.parentElement).toHaveTextContent('*');
      });

      it('Then shows all device type options', () => {
        render(<DeviceForm {...defaultProps} />);

        Object.values(DeviceType).forEach((type) => {
          expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
        });
      });
    });

    describe('When submitting valid device data', () => {
      it('Then creates device with correct data structure', async () => {
        render(<DeviceForm {...defaultProps} />);

        const inputs = screen.getAllByRole('textbox');
        const nameInput = inputs[0];
        const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
        const typeSelect = screen.getByTestId('device-type-select');
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
      });

      it('Then handles empty optional location field as null', async () => {
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
    });

    describe('When submitting invalid data', () => {
      it('Then prevents submission and shows validation errors for empty required fields', async () => {
        render(<DeviceForm {...defaultProps} />);

        const submitButton = screen.getByText('Create');
        await userEvent.click(submitButton);

        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Serial number is required')).toBeInTheDocument();
        expect(screen.getByText('Firmware version is required')).toBeInTheDocument();
      });

      it('Then shows validation error for invalid name', async () => {
        isValidNameSpy.mockReturnValue(false);

        render(<DeviceForm {...defaultProps} />);

        const nameInput = screen.getAllByRole('textbox')[0];
        const submitButton = screen.getByText('Create');

        await userEvent.type(nameInput, 'ab');
        await userEvent.click(submitButton);

        expect(screen.getByText('Name must be between 1 and 100 characters')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });

      it('Then shows validation error for invalid serial number', async () => {
        isValidSerialNumberSpy.mockReturnValue(false);

        render(<DeviceForm {...defaultProps} />);

        const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
        const submitButton = screen.getByText('Create');

        await userEvent.type(serialNumberInput, 'invalid');
        await userEvent.click(submitButton);

        expect(screen.getByText('Serial number must be at least 3 characters')).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });

      it('Then shows validation error for invalid firmware version', async () => {
        isValidFirmwareVersionSpy.mockReturnValue(false);

        render(<DeviceForm {...defaultProps} />);

        const firmwareInput = screen.getByPlaceholderText('1.0.0');
        const submitButton = screen.getByText('Create');

        await userEvent.type(firmwareInput, 'invalid');
        await userEvent.click(submitButton);

        expect(
          screen.getByText('Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)')
        ).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    describe('When clicking the cancel button', () => {
      it('Then calls the cancel handler', async () => {
        render(<DeviceForm {...defaultProps} />);

        const cancelButton = screen.getByText('Cancel');
        await userEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given a user wants to edit an existing device', () => {
    describe('When the edit form is displayed', () => {
      it('Then shows edit form with pre-populated data', () => {
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

      it('Then shows all device status options', () => {
        render(<DeviceForm {...defaultProps} device={mockDevice} />);

        Object.values(DeviceStatus).forEach((status) => {
          expect(screen.getByRole('option', { name: status })).toBeInTheDocument();
        });
      });
    });

    describe('When submitting updated device data', () => {
      it('Then updates device with correct data structure', async () => {
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
      });

      it('Then skips serial number validation in edit mode', async () => {
        isValidSerialNumberSpy.mockReturnValue(false);

        render(<DeviceForm {...defaultProps} device={mockDevice} />);

        const submitButton = screen.getByText('Update');
        await userEvent.click(submitButton);

        expect(DeviceModel.isValidSerialNumber).not.toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Given the form is in submitting state', () => {
    describe('When isSubmitting is true', () => {
      it('Then disables all buttons and shows loading state', () => {
        render(<DeviceForm {...defaultProps} isSubmitting={true} />);

        expect(screen.getByText('Saving...')).toBeDisabled();
        expect(screen.getByText('Cancel')).toBeDisabled();
      });
    });
  });

  describe('Given a user interacts with form fields', () => {
    describe('When typing in input fields', () => {
      it('Then updates the input values in real-time', async () => {
        render(<DeviceForm {...defaultProps} />);

        const nameInput = screen.getAllByRole('textbox')[0];
        await userEvent.type(nameInput, 'Test Device');

        expect(nameInput).toHaveValue('Test Device');
      });

      it('Then clears validation errors when correcting invalid input', async () => {
        isValidNameSpy.mockReturnValue(false);

        render(<DeviceForm {...defaultProps} />);

        const nameInput = screen.getAllByRole('textbox')[0];
        const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
        const firmwareInput = screen.getByPlaceholderText('1.0.0');
        const submitButton = screen.getByText('Create');

        // Trigger validation error with invalid name
        await userEvent.type(nameInput, 'ab');
        await userEvent.type(serialNumberInput, 'SN-001');
        await userEvent.type(firmwareInput, '1.0.0');

        fireEvent.click(submitButton);

        // Should show validation error for invalid name format
        expect(
          await screen.findByText('Name must be between 1 and 100 characters')
        ).toBeInTheDocument();

        // Fix the error
        isValidNameSpy.mockReturnValue(true);
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Valid Name');

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(
            screen.queryByText('Name must be between 1 and 100 characters')
          ).not.toBeInTheDocument();
          expect(mockOnSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              name: 'Valid Name',
              serialNumber: 'SN-001',
              firmwareVersion: '1.0.0',
            })
          );
        });
      });
    });

    describe('When navigating with keyboard', () => {
      it('Then allows proper tab navigation between fields', async () => {
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
  });

  describe('Given form submission encounters an error', () => {
    describe('When the submission promise rejects', () => {
      it('Then keeps the form visible and accessible', async () => {
        render(<DeviceForm {...defaultProps} />);

        const inputs = screen.getAllByRole('textbox');
        const nameInput = inputs[0];
        const serialNumberInput = screen.getByPlaceholderText('XX-000-XXX');
        const firmwareInput = screen.getByPlaceholderText('1.0.0');

        fireEvent.change(nameInput, { target: { value: 'New Device' } });
        fireEvent.change(serialNumberInput, { target: { value: 'ND-001-A' } });
        fireEvent.change(firmwareInput, { target: { value: '1.0.0' } });

        const error = new Error('Network error');
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
  });
});
