const EMAIL_LOCAL_PART = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const EMAIL_DOMAIN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

export const isValidEmail = (value) => {
  if (typeof value !== 'string' || value.length > 254) return false;
  const separator = value.lastIndexOf('@');
  if (separator < 1 || separator > 64) return false;
  return EMAIL_LOCAL_PART.test(value.slice(0, separator)) && EMAIL_DOMAIN.test(value.slice(separator + 1));
};
