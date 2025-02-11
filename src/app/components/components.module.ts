import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { ComponentsRoutingModule } from './components-routing.module';
import { CalendarComponent } from './calendar/calendar.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ComponentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    CalendarComponent,
  ],
})
export class ComponentsModule {}
