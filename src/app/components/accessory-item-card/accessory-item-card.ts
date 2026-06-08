import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Accessory } from '../../models/accessory.model';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-accessory-item-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './accessory-item-card.html',
  styleUrl: './accessory-item-card.scss',
})
export class AccessoryItemCard {
  private readonly authService = inject(AuthService);

  readonly accessory = input.required<Accessory>();
  readonly countChange = output<number>();
  readonly remove = output<void>();

  readonly canEdit = () => this.authService.canWrite();

  increment(): void {
    this.countChange.emit(this.accessory().count + 1);
  }

  decrement(): void {
    const next = Math.max(0, this.accessory().count - 1);
    this.countChange.emit(next);
  }
}
