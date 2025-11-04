import * as yup from 'yup';

const contact_yup_schema = yup
  .string()
  .required('Contact is required')
  .test(
    'is-valid-contact',
    'Please provide a valid email address or phone number',
    function (value) {
      if (!value) return false;
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^\+?[0-9]{10,15}$/.test(value);
      return isEmail || isPhone;
    },
  );

const password_yup_schema = yup
  .string()
  .min(6, 'Min 6 characters')
  .required('Password is required');

export const login_schema = yup.object().shape({
  contact: contact_yup_schema,

  password: password_yup_schema,
});


export const signupSchema = yup.object().shape({
  role: yup.string().oneOf(['User', 'Driver']).required('Select a role').default('User'),
  name: yup.string().trim().min(3, 'Name must be at least 3 characters').required('Name is required'),
  contact: contact_yup_schema,
  password: password_yup_schema,
});

export const verify_schema = yup.object().shape({
  code:yup
  .string()
  .min(4, 'Min 4 characters')
  .required('Please Otp first'),
});


export const forgot_schema = yup.object().shape({
  contact: contact_yup_schema,

});

export const set_pass_schema = yup.object().shape({
  password: password_yup_schema,
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),

});