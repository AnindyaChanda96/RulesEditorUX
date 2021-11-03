import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core'
import { RulesEditorUtils } from '../../utils/rules-editor.utils'
import { EditorRule } from '../../models/rules-editor-row.model'
import { Field, LogicalOperator, Operator, OperatorSet, Value } from 'src/app/models/rules-editor-main.model'

@Component({
  selector: 'rules-editor-row',
  templateUrl: './rules-editor-row.component.html',
  styleUrls: ['./rules-editor-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RulesEditorRowComponent implements OnInit {
  @Input() uniqueId: string | undefined
  @Input() clauseIndex: number = -1
  @Input() clauseDetails: EditorRule | undefined
  @Input()
  public set maxGroupLevel(maxGroupLevel: number) {
    const levels = []
    for (let level = 1; level < maxGroupLevel; level++) {
      levels.push(level)
    }
    this.groupUiLevels = levels
    this.groupUiCellWidth = (
      (maxGroupLevel - 1) *
      this.groupUiDivWidth
    ).toString()
  }
  @Output() createClause = new EventEmitter()
  @Output() removeClause = new EventEmitter()
  @Output() removeGroup = new EventEmitter()
  @Output() clauseUpdated = new EventEmitter()
  @Output() isCheckedToggled = new EventEmitter()

  public logicalOperators: LogicalOperator[] | LogicalOperator[] = []
  public fields: Field[] | Field[] = []
  public operators: Operator[] | Operator[] = []
  public values: Value[] | Value[] = []

  public selectedLogicalOperator: LogicalOperator | undefined
  public selectedField: string | undefined
  public selectedOperator: Operator | undefined
  public selectedValue: string | undefined
  public selectedFieldTooltip = ''
  public selectedValueTooltip = ''

  public isValueDisabled = false

  public groupUiLevels: number[] = []
  public groupUiColors: string[] = [
    'rgba(249,235,235,1)',
    'rgba(251,242,236,1)',
    'rgba(239,246,252,1)',
    'rgba(251,242,236,1)',
    'rgba(223,246,221,1)',
  ]
  public groupUiDivWidth = 20
  public groupUiDivHeight = 36
  public groupUiBorderColor =
    '1px solid rgba(var(--palette-neutral-20,200, 200, 200),1)'
  public groupUiCellWidth: string | undefined

  ngOnInit() {
    this.initClauseRowData()
  }

  initClauseRowData() {
    if (this.clauseDetails) {
      this.logicalOperators = this.clauseDetails.logicalOperators
        ? this.clauseDetails.logicalOperators
        : this.populateDefaultLogicalOperators()
      this.fields = this.clauseDetails.fields
      if (!this.clauseDetails.operators) {
        this.populateDefaultOperators()
      }
      this.values = this.clauseDetails.values

      this.selectedLogicalOperator = RulesEditorUtils.getItemFromArrayByName(this.logicalOperators, this.clauseDetails.selectedLogicalOperator)
      this.selectedField = (RulesEditorUtils.getItemFromArrayByName(this.fields, this.clauseDetails.selectedField)).name
      this.selectedFieldTooltip = ''
      if (this.fields && this.fields.length >= 0) {
        this.fields.forEach((field: Field) => {
          if (this.selectedField === field.name) {
            this.selectedFieldTooltip = field.tooltip ? field.tooltip : ''
          }
        })
      }
      if (this.clauseDetails.operators && this.selectedField) {
        let fieldType = 'string'
        this.fields.forEach((field: Field) => {
          if (field.name === this.selectedField) {
            fieldType = field.type ? field.type : fieldType
          }
        })
        this.clauseDetails.operators.forEach((operatorSet: OperatorSet) => {
          if (operatorSet.type && operatorSet.type.toLowerCase() === fieldType.toLowerCase()) {
            this.operators = operatorSet.operators
          }
        })
      }
      this.selectedOperator = RulesEditorUtils.getItemFromArrayByName(this.operators, this.clauseDetails.selectedOperator)
      this.selectedValue = (RulesEditorUtils.getItemFromArrayByName(this.values, this.clauseDetails.selectedValue)).name
      this.selectedValueTooltip = ''
      if (this.values && this.values.length >= 0) {
        this.values.forEach((value: Value) => {
          if (this.selectedValue === value.name) {
            this.selectedValueTooltip = value.tooltip ? value.tooltip : ''
          }
        })
      }
      this.isValueDisabled = false
      if (this.selectedOperator && this.selectedOperator.isValueRequired === false) {
        this.selectedValue = ''
        this.isValueDisabled = true
      } 
    }
  }

  populateOperators(selectedField: string) {
    let fieldType = 'string'
    if (this.fields && this.fields.length >= 0) {
      this.fields.forEach((field: Field) => {
        if (field.name && field.name.toLowerCase() === selectedField.toLowerCase()) {
          fieldType = field.type ? field.type : fieldType
        }
      })
    }
    if (
      this.clauseDetails &&
      this.clauseDetails.operators &&
      this.clauseDetails.operators.length >= 0
    ) {
      this.clauseDetails.operators.forEach((operatorSet: OperatorSet) => {
        if (operatorSet.type && fieldType && operatorSet.type.toLowerCase() === fieldType.toLowerCase()) {
          this.operators = operatorSet.operators
        }
      })
    }
  }

  populateDefaultLogicalOperators(): LogicalOperator[] {
    return [
      {
        name: 'And',
        value: '&&',
      },
      {
        name: 'Or',
        value: '||',
      },
    ]
  }

  populateDefaultOperators() {
    this.operators = [
      { name: '=', value: '==', isValueRequired: true },
      { name: '<>', value: '!=', isValueRequired: true },
      { name: 'Contains', value: 'Contains', isValueRequired: true },
      { name: 'Does Not Contain', value: '!Contains', isValueRequired: true },
      { name: 'In', value: 'In', isValueRequired: true },
      { name: 'Not In', value: '!In', isValueRequired: true },
      { name: 'Is Empty', value: '==', isValueRequired: false },
      { name: 'Is Not Empty', value: '!=', isValueRequired: false },
      { name: 'StartsWith', value: 'StartsWith', isValueRequired: true },
      { name: 'EndsWith', value: 'EndsWith', isValueRequired: true },
    ]
  }

  onLogicalOperatorChange(selectedItem: LogicalOperator) {
    this.selectedLogicalOperator = selectedItem
    if (this.clauseDetails) {
      this.clauseDetails.selectedLogicalOperator = selectedItem.name
    }
    this.clauseUpdated.emit('clauseUpdated')
  }

  onFieldChange(selectedItem: string) {
    this.selectedField = selectedItem
    if (this.clauseDetails) {
      this.clauseDetails.selectedField = selectedItem
    }
    this.selectedFieldTooltip = ''
    if (this.fields && this.fields.length >= 0) {
      this.fields.forEach((field: Field) => {
        if (selectedItem === field.name) {
          this.selectedFieldTooltip = field.tooltip ? field.tooltip : ''
        }
      })
    }
    this.populateOperators(selectedItem)
    this.clauseUpdated.emit('clauseUpdated')
  }

  onOperatorChange(selectedItem: Operator) {
    this.selectedOperator = selectedItem
    if (this.clauseDetails) {
      this.clauseDetails.selectedOperator = selectedItem.name
    }
    this.isValueDisabled = false
    if (selectedItem && selectedItem.isValueRequired === false) {
      this.selectedValue = ''
      this.isValueDisabled = true
    }
    this.clauseUpdated.emit('clauseUpdated')
  }

  onValueChange(selectedItem: string) {
    this.selectedValue = selectedItem
    if (this.clauseDetails) {
      this.clauseDetails.selectedValue = selectedItem
    }
    this.selectedValueTooltip = ''
    if (this.values && this.values.length >= 0) {
      this.values.forEach((value: Value) => {
        if (selectedItem === value.name) {
          this.selectedValueTooltip = value.tooltip ? value.tooltip : ''
        }
      })
    }
    this.clauseUpdated.emit('clauseUpdated')
  }

  addNewClauseRowInEditor() {
    this.createClause.emit({
      clauseIndex: this.clauseIndex,
    })
  }

  removeClauseRowFromEditor() {
    this.removeClause.emit({
      clauseIndex: this.clauseIndex,
    })
  }

  removeGroupFromEditor(groupUiDivIndex: number) {
    if(this.clauseDetails) {
      this.removeGroup.emit(this.clauseDetails.groupMembership[groupUiDivIndex])
    }
  }

  onkeydown(event: any, eventName: string) {
    const enterKeyCode = 13
    const keycode = event.keyCode || event.which
    if (keycode === enterKeyCode && eventName === 'addClause') {
      this.addNewClauseRowInEditor()
    } else if (keycode === enterKeyCode && eventName === 'removeClause') {
      this.removeClauseRowFromEditor()
    }
  }

  groupingCheckToggled(isChecked: boolean) {
    this.isCheckedToggled.emit({ clauseIndex: this.clauseIndex, isChecked })
  }

  getGroupDivStyle(groupUiDivIndex: number): any {
    const groupColorIndex = groupUiDivIndex % this.groupUiColors.length
    let color = this.groupUiColors[groupColorIndex]
    let hasLeftBorder = true
    let hasTopBorder = false
    let hasBottomBorder = false
    if(this.clauseDetails) {
      hasTopBorder = this.clauseDetails.groupMembershipIsStart[groupUiDivIndex]
      hasBottomBorder = this.clauseDetails.groupMembershipIsEnd[groupUiDivIndex]
      if (this.clauseDetails.groupLevel <= groupUiDivIndex + 1) {
        hasLeftBorder = false
        color = 'transparent'
        for (let level = groupUiDivIndex - 1; level >= 0; level--) {
          if (this.clauseDetails.groupLevel > level + 1) {
            color = this.groupUiColors[level % this.groupUiColors.length]
            hasTopBorder = this.clauseDetails.groupMembershipIsStart[level]
            hasBottomBorder = this.clauseDetails.groupMembershipIsEnd[level]
            break
          }
        }
      }
    }

    return {
      width: this.groupUiDivWidth + 'px',
      height: this.groupUiDivHeight + 'px',
      'background-color': color,
      'border-left': hasLeftBorder ? this.groupUiBorderColor : 'none',
      'border-top': hasTopBorder ? this.groupUiBorderColor : 'none',
      'border-bottom': hasBottomBorder ? this.groupUiBorderColor : 'none',
      display: 'inline-block',
    }
  }

  isGroupStartIndex(groupUiDivIndex: number): boolean {
    let isGroupStartIndex = false
    if (
      this.clauseDetails &&
      this.clauseDetails.groupLevel > groupUiDivIndex + 1 &&
      this.clauseDetails.groupMembershipIsStart[groupUiDivIndex]
    ) {
      isGroupStartIndex = true
    }

    return isGroupStartIndex
  }
}
