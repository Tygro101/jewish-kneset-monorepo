import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { loadConfig } from '../store/config/configSlice';
import { getConfigSelector } from '../store/config/configSelectors';
import './EntrancePage.scss';

const TENANT_ID_REGEX = /^[a-z0-9][a-z0-9-]{1,60}$/;

/**
 * Validates a tenant ID against the canonical format used by the CMS.
 * Must start with a lowercase letter or digit, followed by 1-60 lowercase
 * alphanumeric characters or hyphens.
 */
export const isValidTenantId = (id: string): boolean => TENANT_ID_REGEX.test(id);

/**
 * Entrance page shown when no Bet Kneset ID is configured.
 * The user enters their synagogue ID (= the GitHub repo name under the org).
 * On success the app persists the ID and proceeds to the clock display.
 */
export const EntrancePage = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(getConfigSelector);
  const [inputId, setInputId] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputId(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inputId.trim().toLowerCase();
    if (!id) return;

    if (!isValidTenantId(id)) {
      setValidationError('מזהה לא תקין — אותיות קטנות באנגלית, מספרים ומקפים בלבד');
      return;
    }

    dispatch(loadConfig(id));
  };

  const isLoading = status === 'loading';

  return (
    <div className="entrance-page">
      <div className="entrance-card">
        <h1 className="entrance-title">בית כנסת חכם</h1>
        <p className="entrance-subtitle">הזן את מזהה בית הכנסת כדי להתחיל</p>

        <form className="entrance-form" onSubmit={handleSubmit}>
          <input
            className="entrance-input"
            type="text"
            dir="ltr"
            placeholder="e.g. kneset-or-chaim"
            value={inputId}
            onChange={handleInputChange}
            disabled={isLoading}
            autoFocus
            aria-label="Bet Kneset ID"
          />
          <button
            className="entrance-btn"
            type="submit"
            disabled={isLoading || !inputId.trim()}
          >
            {isLoading ? 'טוען...' : 'התחבר'}
          </button>
        </form>

        {validationError && (
          <p className="entrance-error" role="alert">
            {validationError}
          </p>
        )}

        {status === 'error' && (
          <p className="entrance-error" role="alert">
            {error || 'שגיאה בטעינת הנתונים'}
          </p>
        )}
      </div>
    </div>
  );
};
