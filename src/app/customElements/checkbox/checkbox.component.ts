import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core'

@Component({
  selector: 'custom-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomCheckboxComponent implements OnChanges {
  @Input()
  isChecked = false
  @Input()
  name = ''
  @Input()
  id? = ''
  @Input()
  disabled?: false
  @Input()
  type = 'square'
  @Input()
  size: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm'
  @Input()
  customClass?: any
  @Input()
  allowFocus? = true

  @Output()
  onSelect? = new EventEmitter()

  @Output()
  isCheckedChange = new EventEmitter()

  onClick($event: any) {
    if (this.disabled) {
      return
    }
    this.isChecked = !this.isChecked
    this.isCheckedChange.emit(this.isChecked)
    if (this.onSelect) {
      this.onSelect.emit({ isChecked: this.isChecked, event: $event })
    }
  }

  // tslint:disable-next-line:no-empty
  ngOnChanges(changes: SimpleChanges) {}
}
