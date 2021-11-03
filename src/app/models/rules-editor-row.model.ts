import { Field, LogicalOperator, Operator, OperatorSet, Value } from "./rules-editor-main.model"

export class EditorRule {
    logicalOperators: LogicalOperator[] = []
    fields: Field[] = []
    operators: OperatorSet[] = []
    values: Value[] = []
    selectedLogicalOperator?: string
    selectedField?: string
    selectedOperator?: string
    selectedValue?: string
    groupLevel: number = 1
    groupMembership: number[] = []
    groupMembershipIsStart: boolean[] = []
    groupMembershipIsEnd: boolean[] = []
  }
  