import {
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core'
import { Field, LogicalOperator, OperatorSet, Rule, RulesEditorInput, Value } from '../../models/rules-editor-main.model'

@Component({
    selector: 'sample-editor',
    templateUrl: './sample-editor.component.html',
    styleUrls: ['./sample-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SampleComponent implements OnInit {
    public sampleEditorInput = new RulesEditorInput()

    ngOnInit() {
        this.sampleEditorInput = {
            'logicalOperators': this.setLogicalOperators(),
            'fields': this.setFields(),
            'operators': this.setOperatorSets(),
            'values': this.setValues(),
            'activeClauses': []
        }
    }

    setLogicalOperators(): LogicalOperator[] {
        const logicalOperators: LogicalOperator[] = []
        logicalOperators.push({
            'name': 'And',
            'value': '&&'
        })
        logicalOperators.push({
            'name': 'Or',
            'value': '||'
        })
        
        return logicalOperators
    }

    setFields(): Field[] {
        const fields: Field[] = []
        fields.push({
            'name': 'Field A',
            'value': 'FieldA',
            'type': 'string',
            'tooltip': 'Tooltip for Field A'
        })
        fields.push({
            'name': 'Field B',
            'value': 'FieldB',
            'type': 'string',
            'tooltip': 'Tooltip for Field B'
        })

        return fields
    }

    setOperatorSets(): OperatorSet[] {
        const operatorSets: OperatorSet[] = []
        operatorSets.push({
            'type': 'string',
            'operators': [
                {
                    'name': 'Equals',
                    'value': '==',
                    'isValueRequired': true
                },
                {
                    'name': 'Contains',
                    'value': 'selectedField.Contains(selectedValue)',
                    'isValueRequired': true
                },
                {
                    'name': 'DoesNotContain',
                    'value': '!selectedField.Contains(selectedValue)',
                    'isValueRequired': true
                },
                {
                    'name': 'IsEmptyOrNull',
                    'value': 'selectedField.IsNullorEmpty()',
                    'isValueRequired': false
                }
            ]
        })

        return operatorSets
    }

    setValues(): Value[] {
        const values: Value[] = []
        values.push({
            'name': 'Value A',
            'value': 'ValueA',
            'type': 'string',
            'tooltip': 'Tooltip for Value A'
        })
        values.push({
            'name': 'Value B',
            'value': 'ValueB',
            'type': 'string',
            'tooltip': 'Tooltip for Value B'
        })

        return values
    }

    onEditorOuput(updatedRules: Rule[]) {
        console.log(updatedRules)
    }
}