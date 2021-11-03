import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'
import { AppRoutingModule } from './rules-editor-routing.module';
import { CustomCheckboxComponent } from './customElements/checkbox/checkbox.component';
import { CustomComboBoxComponent } from './customElements/combobox/combo-box.component';
import { RulesEditorMainComponent } from './components/rules-editor-main/rules-editor-main.component';
import { RulesEditorRowComponent } from './components/rules-editor-row/rules-editor-row.component';
import { SampleComponent } from './components/sample/sample-editor.component';

@NgModule({
  declarations: [
    CustomCheckboxComponent,
    CustomComboBoxComponent,
    RulesEditorMainComponent,
    RulesEditorRowComponent,
    SampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [SampleComponent],
  exports: [RulesEditorMainComponent]
})
export class AppModule { }
