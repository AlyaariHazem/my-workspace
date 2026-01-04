# hijiri-date

A small Angular library that adds **hijiri (Islamic) date support** to your Angular forms.

It gives you:

- A ready-to-use hijiri date input component: **`<lib-hijiri-date-field>`**
- Strong validation for:
  - Required fields
  - Correct hijiri format (example: `10/04/1447`)
  - Real hijiri dates (no impossible values)
  - Min/Max hijiri range checks
- A clean way to **store and send the date to your backend** as hijiri (`iYYYY-iMM-iDD`) or Gregorian (`YYYY-MM-DD`)
- Optional UI integration using **Angular Material** and **Syncfusion calendars**, while keeping the logic powered by **moment-hijiri**

---

## Contents

- [What this library does](#what-this-library-does)
- [When to use it](#when-to-use-it)
- [Requirements / Peer dependencies](#requirements--peer-dependencies)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Using the hijiri date field in a Reactive Form](#using-the-hijiri-date-field-in-a-reactive-form)
  - [1) Import the module](#1-import-the-module)
  - [2) Create the FormControl](#2-create-the-formcontrol)
  - [3) Add the component in HTML](#3-add-the-component-in-html)
  - [4) Show validation messages](#4-show-validation-messages)
- [Working with min/max/startAt](#working-with-minmaxstartat)
- [How to send hijiri date to the backend](#how-to-send-hijiri-date-to-the-backend)
  - [Send hijiri formatted string](#send-hijiri-formatted-string)
  - [Send Gregorian formatted string](#send-gregorian-formatted-string)
  - [What is stored in the FormControl value](#what-is-stored-in-the-formcontrol-value)
- [Backend / API expectations](#backend--api-expectations)
- [Common validation errors](#common-validation-errors)
- [Troubleshooting](#troubleshooting)
- [Maintainer notes](#maintainer-notes)
- [License](#license)

---

## What this library does

This library focuses on **hijiri date inputs in Angular forms**.

It provides a field that users can type into or pick a date from, and it helps you ensure:

- The user entered a hijiri date in the correct format
- The date is actually valid in the hijiri calendar
- The date is inside an allowed range (min/max)
- You can easily convert the selected date to the format your backend expects

---

## When to use it

Use this library if your app needs:

- hijiri date entry (Saudi, Gulf, Islamic calendar workflows, etc.)
- Validation for hijiri inputs
- Consistent output format to send to your API/database

Typical examples:
- Civil identity expiration
- Iqama expiration
- Contract dates
- Government forms / HR systems

---

## Requirements / Peer dependencies

This library expects the consuming application to provide these dependencies:

- `moment`
- `moment-hijiri`

If you use the UI field component (`<lib-hijiri-date-field>`) you will also need:

- `@angular/material`
- `@syncfusion/ej2-angular-calendars`

> Why are these "peerDependencies"?
> Because your application owns the UI framework versions. This prevents duplicate framework copies and avoids Angular version conflicts.

---

## Installation

### 1) Install the library

```bash
npm i hijiri-date
