import { renderHook, act } from '@testing-library/react';
import { useDeviceForm } from './index';
import { DeviceModel } from '@/models/Device';
import { DeviceType, DeviceStatus, Device } from '@/graphql/generated';

describe('useDeviceForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnSuccess = jest.fn();

  // Create a mock Device data object
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

  const mockDevice = new DeviceModel(mockDeviceData);

  beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnSuccess.mockReset();
  });

  describe('Given a form in create mode', () => {
    describe('When initialized without a device', () => {
      it('Then has empty initial values', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        expect(result.current.values.name).toBe('');
        expect(result.current.values.serialNumber).toBe('');
        expect(result.current.values.firmwareVersion).toBe('');
        expect(result.current.values.location).toBe('');
      });

      it('Then has default type and status values', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        expect(result.current.values.type).toBe(DeviceType.Sensor);
        expect(result.current.values.status).toBe(DeviceStatus.Online);
      });

      it('Then isEditMode is false', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        expect(result.current.isEditMode).toBe(false);
      });
    });

    describe('When validating device-specific rules', () => {
      it('Then validates name is required', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.errors.name).toBe('Name is required');
      });

      it('Then validates name using DeviceModel.isValidName', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        // Set a name that's too long (> 100 characters)
        act(() => {
          result.current.setField('name', 'a'.repeat(101));
        });

        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.errors.name).toBe('Name must be between 1 and 100 characters');
      });

      it('Then validates serial number is required', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.touchField('serialNumber');
        });

        expect(result.current.errors.serialNumber).toBe('Serial number is required');
      });

      it('Then validates serial number using DeviceModel.isValidSerialNumber', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('serialNumber', 'ab'); // Too short
        });

        act(() => {
          result.current.touchField('serialNumber');
        });

        expect(result.current.errors.serialNumber).toBe(
          'Serial number must be at least 3 characters'
        );
      });

      it('Then validates firmware version is required', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.touchField('firmwareVersion');
        });

        expect(result.current.errors.firmwareVersion).toBe('Firmware version is required');
      });

      it('Then validates firmware version format', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('firmwareVersion', 'invalid');
        });

        act(() => {
          result.current.touchField('firmwareVersion');
        });

        expect(result.current.errors.firmwareVersion).toBe(
          'Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)'
        );
      });

      it('Then does not require location (optional field)', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.touchField('location');
        });

        expect(result.current.errors.location).toBeUndefined();
      });
    });

    describe('When submitting valid create data', () => {
      it('Then calls onSubmit with CreateDeviceInput', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', 'New Device');
          result.current.setField('serialNumber', 'ND-001');
          result.current.setField('type', DeviceType.Gateway);
          result.current.setField('firmwareVersion', '2.0.0');
          result.current.setField('location', 'Lab 2');
        });

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'New Device',
          serialNumber: 'ND-001',
          type: DeviceType.Gateway,
          firmwareVersion: '2.0.0',
          location: 'Lab 2',
        });
      });

      it('Then calls onSuccess after successful submission', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
            onSuccess: mockOnSuccess,
          })
        );

        act(() => {
          result.current.setField('name', 'New Device');
          result.current.setField('serialNumber', 'ND-001');
          result.current.setField('firmwareVersion', '1.0.0');
        });

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSuccess).toHaveBeenCalled();
      });

      it('Then handles empty optional location as null', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', 'New Device');
          result.current.setField('serialNumber', 'ND-001');
          result.current.setField('firmwareVersion', '1.0.0');
          // Don't set location
        });

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            location: null,
          })
        );
      });
    });

    describe('When getCreateInput is called', () => {
      it('Then returns properly formatted CreateDeviceInput', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', '  Trimmed Name  ');
          result.current.setField('serialNumber', '  SN-001  ');
          result.current.setField('type', DeviceType.Camera);
          result.current.setField('firmwareVersion', '  1.0.0  ');
          result.current.setField('location', '  Location  ');
        });

        const input = result.current.getCreateInput();

        expect(input).toEqual({
          name: 'Trimmed Name',
          serialNumber: 'SN-001',
          type: DeviceType.Camera,
          firmwareVersion: '1.0.0',
          location: 'Location',
        });
      });
    });
  });

  describe('Given a form in edit mode', () => {
    describe('When initialized with a device', () => {
      it('Then pre-populates values from device', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        expect(result.current.values.name).toBe(mockDevice.name);
        expect(result.current.values.serialNumber).toBe(mockDevice.serialNumber);
        expect(result.current.values.type).toBe(mockDevice.type);
        expect(result.current.values.status).toBe(mockDevice.status);
        expect(result.current.values.firmwareVersion).toBe(mockDevice.firmwareVersion);
        expect(result.current.values.location).toBe(mockDevice.location);
      });

      it('Then isEditMode is true', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        expect(result.current.isEditMode).toBe(true);
      });
    });

    describe('When validating in edit mode', () => {
      it('Then skips serial number validation', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        // Clear serial number (would be invalid in create mode)
        act(() => {
          result.current.setField('serialNumber', '');
          result.current.touchField('serialNumber');
        });

        expect(result.current.errors.serialNumber).toBeUndefined();
      });

      it('Then skips type validation', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.touchField('type');
        });

        expect(result.current.errors.type).toBeUndefined();
      });

      it('Then still validates name', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', '');
        });

        act(() => {
          result.current.touchField('name');
        });

        expect(result.current.errors.name).toBe('Name is required');
      });

      it('Then still validates firmware version', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('firmwareVersion', 'invalid');
        });

        act(() => {
          result.current.touchField('firmwareVersion');
        });

        expect(result.current.errors.firmwareVersion).toBe(
          'Invalid version format (e.g., 1.0, 2.1.3, v1.0.0)'
        );
      });
    });

    describe('When submitting valid update data', () => {
      it('Then calls onSubmit with UpdateDeviceInput', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', 'Updated Device');
          result.current.setField('status', DeviceStatus.Offline);
          result.current.setField('firmwareVersion', '2.0.0');
          result.current.setField('location', 'New Location');
        });

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: mockDevice.id,
          name: 'Updated Device',
          status: DeviceStatus.Offline,
          firmwareVersion: '2.0.0',
          location: 'New Location',
        });
      });

      it('Then does not include serialNumber or type in update', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        const calledWith = mockOnSubmit.mock.calls[0][0];
        expect(calledWith).not.toHaveProperty('serialNumber');
        expect(calledWith).not.toHaveProperty('type');
      });
    });

    describe('When getUpdateInput is called', () => {
      it('Then returns properly formatted UpdateDeviceInput', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: mockDevice,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', '  Trimmed Name  ');
          result.current.setField('status', DeviceStatus.Maintenance);
          result.current.setField('firmwareVersion', '  3.0.0  ');
        });

        const input = result.current.getUpdateInput();

        expect(input).toEqual({
          id: mockDevice.id,
          name: 'Trimmed Name',
          status: DeviceStatus.Maintenance,
          firmwareVersion: '3.0.0',
          location: mockDevice.location,
        });
      });

      it('Then throws if called without a device', () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        expect(() => result.current.getUpdateInput()).toThrow(
          'Cannot get update input without a device'
        );
      });
    });
  });

  describe('Given form submission fails', () => {
    describe('When onSubmit throws an error', () => {
      it('Then does not call onSuccess', async () => {
        mockOnSubmit.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
            onSuccess: mockOnSuccess,
          })
        );

        act(() => {
          result.current.setField('name', 'New Device');
          result.current.setField('serialNumber', 'ND-001');
          result.current.setField('firmwareVersion', '1.0.0');
        });

        await act(async () => {
          try {
            await result.current.handleSubmit();
          } catch {
            // Expected to throw
          }
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      it('Then re-throws the error', async () => {
        const error = new Error('Network error');
        mockOnSubmit.mockRejectedValue(error);

        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        act(() => {
          result.current.setField('name', 'New Device');
          result.current.setField('serialNumber', 'ND-001');
          result.current.setField('firmwareVersion', '1.0.0');
        });

        await expect(
          act(async () => {
            await result.current.handleSubmit();
          })
        ).rejects.toThrow('Network error');
      });
    });

    describe('When validation fails', () => {
      it('Then does not call onSubmit', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        // Don't fill required fields
        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
      });

      it('Then shows all validation errors', async () => {
        const { result } = renderHook(() =>
          useDeviceForm({
            device: null,
            onSubmit: mockOnSubmit,
          })
        );

        await act(async () => {
          await result.current.handleSubmit();
        });

        expect(result.current.errors.name).toBe('Name is required');
        expect(result.current.errors.serialNumber).toBe('Serial number is required');
        expect(result.current.errors.firmwareVersion).toBe('Firmware version is required');
      });
    });
  });

  describe('Given a device with null location', () => {
    describe('When initialized', () => {
      it('Then converts null location to empty string', () => {
        const deviceWithNullLocation = new DeviceModel({
          ...mockDeviceData,
          location: null,
        });

        const { result } = renderHook(() =>
          useDeviceForm({
            device: deviceWithNullLocation,
            onSubmit: mockOnSubmit,
          })
        );

        expect(result.current.values.location).toBe('');
      });
    });
  });
});
