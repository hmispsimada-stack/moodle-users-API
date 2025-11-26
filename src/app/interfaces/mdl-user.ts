export interface MdlUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  department?: string;
  firstaccess?: number;
  lastaccess?: number;
  auth?: string;
  suspended?: boolean;
  confirmed?: boolean;
  lang?: string;
  theme?: string;
  timezone?: string;
  mailformat?: number;
  trackforums?: number;
  description?: string;
  descriptionformat?: number;
  country?: string;
  profileimageurlsmall?: string;
  profileimageurl?: string;
  customfields?: Customfield[];
  preferences?: Preference[];
}

interface Preference {
  name: string;
  value: number | string;
}

export interface Customfield {
  type: string;
  value: string;
  displayvalue: string;
  name: string;
  shortname: string;
}
