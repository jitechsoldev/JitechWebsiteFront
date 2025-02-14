import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ComponentsRoutingModule } from './components-routing.module';
import { RouterOutlet } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ComponentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    RouterOutlet,
  ],
})
export class ComponentsModule {}
