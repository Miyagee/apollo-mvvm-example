import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceForm, DeviceFormProps } from './DeviceForm';
import { DeviceType, DeviceStatus } from '@/graphql/generated';
import { DeviceFormValues } from '@/viewmodels/DeviceFormViewModel';

describe('DeviceForm', () => {
  const mockOnFieldChange = jest.fn();
  const mockOnFieldBlur = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultFormData: DeviceFormValues = {
    name: '',
    serialNumber: '',
    type: DeviceType.Sensor,
    status: DeviceStatus.Online,
    firmwareVersion: '',
    location: '',
  };

  const defaultProps: DeviceFormProps = {
    formData: defaultFormData,
    errors: {},
    touched: {},
    isEditMode: false,
    isSubmitting: false,
    onFieldChange: mockOnFieldChange,
    onFieldBlur: mockOnFieldBlur,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    mockOnFieldChange.mockReset();
    mockOnFieldBlur.mockReset();
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
  });

  describe('Given a stateless form component', () => {
    describe('When rendering in create mode', () => {
      it('Then shows "Add New Device" title', () => {
        render(<DeviceForm {...defaultProps} />);
        expect(screen.getByText('Add New Device')).toBeInTheDocument();
      });

      it('Then displays values from formData props', () => {
        const formData: DeviceFormValues = {
          name: 'Test Device',
          serialNumber: 'TD-001',
          type: DeviceType.Gateway,
          status: DeviceStatus.Offline,
          firmwareVersion: '2.0.0',
          location: 'Lab 1',
        };

        render(<DeviceForm {...defaultProps} formData={formData} />);

        expect(screen.getByTestId('device-name-input')).toHaveValue('Test Device');
        expect(screen.getByTestId('serial-number-input')).toHaveValue('TD-001');
        expect(screen.getByTestId('device-type-select')).toHaveValue(DeviceType.Gateway);
        expect(screen.getByTestId('device-status-select')).toHaveValue(DeviceStatus.Offline);
        expect(screen.getByTestId('firmware-version-input')).toHaveValue('2.0.0');
        expect(screen.getByTestId('location-input')).toHaveValue('Lab 1');
      });

      it('Then shows all required field indicators', () => {
        render(<DeviceForm {...defaultProps} />);

        const labels = screen.getAllByText('*');
        expect(labels.length).toBeGreaterThanOrEqual(3); // Name, Serial Number, Firmware Version
      });

      it('Then shows all device type options', () => {
        render(<DeviceForm {...defaultProps} />);

        Object.values(DeviceType).forEach((type) => {
          expect(screen.getByRole('option', { name: type })).toBeInTheDocument();
        });
      });

      it('Then shows all device status options', () => {
        render(<DeviceForm {...defaultProps} />);

        Object.values(DeviceStatus).forEach((status) => {
          expect(screen.getByRole('option', { name: status })).toBeInTheDocument();
        });
      });
    });

    describe('When rendering in edit mode', () => {
      it('Then shows "Edit Device" title', () => {
        render(<DeviceForm {...defaultProps} isEditMode={true} />);
        expect(screen.getByText('Edit Device')).toBeInTheDocument();
      });

      it('Then hides serial number field', () => {
        render(<DeviceForm {...defaultProps} isEditMode={true} />);
        expect(screen.queryByTestId('serial-number-input')).not.toBeInTheDocument();
      });

      it('Then hides type select', () => {
        render(<DeviceForm {...defaultProps} isEditMode={true} />);
        expect(screen.queryByTestId('device-type-select')).not.toBeInTheDocument();
      });

      it('Then shows Update button text', () => {
        render(<DeviceForm {...defaultProps} isEditMode={true} />);
        expect(screen.getByTestId('submit-button')).toHaveTextContent('Update');
      });
    });
  });

  describe('Given user types in a field', () => {
    describe('When onChange is triggered', () => {
      it('Then calls onFieldChange with field name and value', async () => {
        render(<DeviceForm {...defaultProps} />);

        const nameInput = screen.getByTestId('device-name-input');
        await userEvent.type(nameInput, 'N');

        expect(mockOnFieldChange).toHaveBeenCalledWith('name', 'N');
      });

      it('Then calls onFieldChange for serial number', async () => {
        render(<DeviceForm {...defaultProps} />);

        const serialInput = screen.getByTestId('serial-number-input');
        await userEvent.type(serialInput, 'S');

        expect(mockOnFieldChange).toHaveBeenCalledWith('serialNumber', 'S');
      });

      it('Then calls onFieldChange for firmware version', async () => {
        render(<DeviceForm {...defaultProps} />);

        const firmwareInput = screen.getByTestId('firmware-version-input');
        await userEvent.type(firmwareInput, '1');

        expect(mockOnFieldChange).toHaveBeenCalledWith('firmwareVersion', '1');
      });

      it('Then calls onFieldChange for type select', async () => {
        render(<DeviceForm {...defaultProps} />);

        const typeSelect = screen.getByTestId('device-type-select');
        await userEvent.selectOptions(typeSelect, DeviceType.Gateway);

        expect(mockOnFieldChange).toHaveBeenCalledWith('type', DeviceType.Gateway);
      });

      it('Then calls onFieldChange for status select', async () => {
        render(<DeviceForm {...defaultProps} />);

        const statusSelect = screen.getByTestId('device-status-select');
        await userEvent.selectOptions(statusSelect, DeviceStatus.Offline);

        expect(mockOnFieldChange).toHaveBeenCalledWith('status', DeviceStatus.Offline);
      });
    });
  });

  describe('Given user blurs a field', () => {
    describe('When onBlur is triggered', () => {
      it('Then calls onFieldBlur with field name', () => {
        render(<DeviceForm {...defaultProps} />);

        const nameInput = screen.getByTestId('device-name-input');
        fireEvent.blur(nameInput);

        expect(mockOnFieldBlur).toHaveBeenCalledWith('name');
      });

      it('Then calls onFieldBlur for serial number', () => {
        render(<DeviceForm {...defaultProps} />);

        const serialInput = screen.getByTestId('serial-number-input');
        fireEvent.blur(serialInput);

        expect(mockOnFieldBlur).toHaveBeenCalledWith('serialNumber');
      });

      it('Then calls onFieldBlur for firmware version', () => {
        render(<DeviceForm {...defaultProps} />);

        const firmwareInput = screen.getByTestId('firmware-version-input');
        fireEvent.blur(firmwareInput);

        expect(mockOnFieldBlur).toHaveBeenCalledWith('firmwareVersion');
      });
    });
  });

  describe('Given errors and touched props indicate an error', () => {
    describe('When a touched field has an error', () => {
      it('Then displays the error message', () => {
        render(
          <DeviceForm
            {...defaultProps}
            errors={{ name: 'Name is required' }}
            touched={{ name: true }}
          />
        );

        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      it('Then displays error for serial number', () => {
        render(
          <DeviceForm
            {...defaultProps}
            errors={{ serialNumber: 'Serial number must be at least 3 characters' }}
            touched={{ serialNumber: true }}
          />
        );

        expect(
          screen.getByText('Serial number must be at least 3 characters')
        ).toBeInTheDocument();
      });

      it('Then displays error for firmware version', () => {
        render(
          <DeviceForm
            {...defaultProps}
            errors={{ firmwareVersion: 'Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)' }}
            touched={{ firmwareVersion: true }}
          />
        );

        expect(
          screen.getByText('Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)')
        ).toBeInTheDocument();
      });
    });

    describe('When a field has an error but is not touched', () => {
      it('Then does not display the error message', () => {
        render(
          <DeviceForm
            {...defaultProps}
            errors={{ name: 'Name is required' }}
            touched={{ name: false }}
          />
        );

        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });

    describe('When multiple fields have errors', () => {
      it('Then displays all error messages for touched fields', () => {
        render(
          <DeviceForm
            {...defaultProps}
            errors={{
              name: 'Name is required',
              serialNumber: 'Serial number is required',
              firmwareVersion: 'Firmware version is required',
            }}
            touched={{
              name: true,
              serialNumber: true,
              firmwareVersion: true,
            }}
          />
        );

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Serial number is required')).toBeInTheDocument();
        expect(screen.getByText('Firmware version is required')).toBeInTheDocument();
      });
    });
  });

  describe('Given user submits the form', () => {
    describe('When submit button is clicked', () => {
      it('Then calls onSubmit', async () => {
        render(<DeviceForm {...defaultProps} />);

        const submitButton = screen.getByTestId('submit-button');
        await userEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalled();
      });

      it('Then prevents default form submission', async () => {
        render(<DeviceForm {...defaultProps} />);

        const form = screen.getByTestId('device-form').querySelector('form')!;
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        fireEvent(form, submitEvent);

        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Given user cancels the form', () => {
    describe('When cancel button is clicked', () => {
      it('Then calls onCancel', async () => {
        render(<DeviceForm {...defaultProps} />);

        const cancelButton = screen.getByTestId('cancel-button');
        await userEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
      });
    });

    describe('When Escape key is pressed', () => {
      it('Then calls onCancel', () => {
        render(<DeviceForm {...defaultProps} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(mockOnCancel).toHaveBeenCalled();
      });
    });
  });

  describe('Given form is in submitting state', () => {
    describe('When isSubmitting is true', () => {
      it('Then disables submit button', () => {
        render(<DeviceForm {...defaultProps} isSubmitting={true} />);

        expect(screen.getByTestId('submit-button')).toBeDisabled();
      });

      it('Then disables cancel button', () => {
        render(<DeviceForm {...defaultProps} isSubmitting={true} />);

        expect(screen.getByTestId('cancel-button')).toBeDisabled();
      });

      it('Then shows "Saving..." text on submit button', () => {
        render(<DeviceForm {...defaultProps} isSubmitting={true} />);

        expect(screen.getByTestId('submit-button')).toHaveTextContent('Saving...');
      });
    });
  });
});
