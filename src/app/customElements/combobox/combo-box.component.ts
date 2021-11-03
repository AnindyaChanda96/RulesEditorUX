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
  selector: 'custom-select',
  templateUrl: './combo-box.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./combo-box.component.scss'],
})
export class CustomComboBoxComponent implements OnChanges {
  @Input()
  CbModel: any = []
  @Input()
  selected: any
  @Input()
  name = ''
  @Input()
  disabled = false
  @Input()
  ariaLabelledBy = ''
  @Input() ariaLabel = ''
  @Output()
  onSelect = new EventEmitter()

  @Output()
  onSelectClick(selectedItem: any) {
    const item = this.CbModel[selectedItem.target.selectedIndex]
    this.selected = item
    if (this.onSelect !== undefined) {
      this.onSelect.emit(item)
    }
  }

  // tslint:disable-next-line:no-empty
  ngOnChanges(changes: SimpleChanges) {}
}
