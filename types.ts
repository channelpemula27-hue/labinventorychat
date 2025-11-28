export interface User {
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'form-list' | 'dashboard-link';
  metadata?: any;
}

export interface FormLink {
  title: string;
  url: string;
  icon: string;
  description: string;
}

export const FORM_LINKS: FormLink[] = [
  {
    title: "Usage Log",
    url: "https://airtable.com/appyhbedlTyTgOBCB/pag4ygzHonoUgo1ez/form",
    icon: "clipboard-list",
    description: "Log item usage in the lab"
  },
  {
    title: "Item Receipt",
    url: "https://airtable.com/appyhbedlTyTgOBCB/pagbiDDluZm2ww1hD/form",
    icon: "box-seam",
    description: "Record new inventory items"
  },
  {
    title: "Preparation Log",
    url: "https://airtable.com/appyhbedlTyTgOBCB/pag0Gd5dq5g1xrijH/form",
    icon: "flask",
    description: "Document preparation activities"
  },
  {
    title: "Order Request",
    url: "https://airtable.com/appyhbedlTyTgOBCB/pagD8bWjDLCeoVjpX/form",
    icon: "shopping-cart",
    description: "Request new supplies"
  }
];

export const DASHBOARD_URL = "https://airtable.com/appyhbedlTyTgOBCB"; // Assuming base URL as dashboard or generic link
