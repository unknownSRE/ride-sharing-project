import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { VehicleService } from '../../services/vehicle-service';
import { AuthService } from '../../services/auth.service';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './vehicle.html',
  styleUrls: ['./vehicle.css']
})
export class VehicleComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private authService = inject(AuthService);

  vehicles: Vehicle[] = [];
  
  get driverId(): number | null {
    return this.authService.getUser()?.user_id || null;
  }

  newVehicle: Vehicle = {
    vehicleNumber: '',
    vehicleType: '',
    driverName: '',
    status: 'Available'
  } as any;

  ngOnInit(): void {
    if (this.driverId) {
      this.loadVehicle();
    }
  }

  loadVehicle(): void {
    if (!this.driverId) {
      console.error('Driver ID not available');
      return;
    }

    this.vehicleService.getVehicleByDriver(this.driverId).subscribe({
      next: (response) => {
        if (response.data?.getVehicleByDriver) {
          const vehicle = response.data.getVehicleByDriver;
          this.vehicles = [this.mapVehicleData(vehicle)];
        } else {
          this.vehicles = [];
        }
      },
      error: (err) => {
        console.error('Failed to load vehicle', err);
        this.vehicles = [];
      }
    });
  }

  addVehicle(): void {
    if (!this.driverId) {
      alert('Please login as a driver to register a vehicle.');
      return;
    }

    if (!this.newVehicle.vehicleNumber || !this.newVehicle.vehicleType) {
      alert('Vehicle Number and Type are required');
      return;
    }

    const payload = {
      make: this.newVehicle.vehicleType,
      model: this.newVehicle.vehicleType,
      plate_number: this.newVehicle.vehicleNumber,
      color: '',
      year: new Date().getFullYear(),
      driver_id: this.driverId
    };

    this.vehicleService.registerVehicle(payload).subscribe({
      next: (response) => {
        if (response.data?.registerVehicle) {
          alert('Vehicle registered successfully!');
          this.loadVehicle();
          this.resetForm();
        } else if (response.errors) {
          alert(`Error: ${response.errors[0].message}`);
        }
      },
      error: (err) => {
        console.error('Failed to add vehicle', err);
        alert(`Error: ${err.message || 'Failed to register vehicle'}`);
      }
    });
  }

  deleteVehicle(): void {
    if (!this.driverId) {
      alert('Please login as a driver.');
      return;
    }

    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    this.vehicleService.deleteVehicle(this.driverId).subscribe({
      next: (response) => {
        if (response.data?.deleteVehicle) {
          alert('Vehicle deleted successfully!');
          this.vehicles = [];
        } else if (response.errors) {
          alert(`Error: ${response.errors[0].message}`);
        }
      },
      error: (err) => {
        console.error('Failed to delete vehicle', err);
        alert(`Error: ${err.message || 'Failed to delete vehicle'}`);
      }
    });
  }

  private mapVehicleData(data: any): Vehicle {
    return {
      id: data.vehicle_id,
      vehicleNumber: data.plate_number,
      vehicleType: data.make,
      driverName: '',
      capacity: 0,
      status: 'Available'
    };
  }

  private resetForm(): void {
    this.newVehicle = {
      vehicleNumber: '',
      vehicleType: '',
      driverName: '',
      capacity: 0,
      status: 'Available'
    };
  }
}
