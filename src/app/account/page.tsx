'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import styles from './account.module.css';

export default function AccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    avatar_url: '',
  });

  // Загружаем профиль пользователя
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setFormData({
              full_name: profile.full_name || '',
              username: profile.username || '',
              bio: profile.bio || '',
              avatar_url: profile.avatar_url || '',
            });
          }
        } catch (error) {
          console.error('Ошибка загрузки профиля:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Обновляем профиль в таблице profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Также обновляем метаданные пользователя в auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          name: formData.full_name,
        }
      });

      if (authError) throw authError;

      setSuccessMessage('Профиль успешно обновлен!');
      
      // Обновляем страницу через 2 секунды, чтобы изменения применились
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      setErrorMessage(error.message || 'Ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className={styles.accountPage}>
      <h1 className={styles.title}>Мой профиль</h1>
      
      {successMessage && (
        <div className={styles.successMessage}>
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-circle"></i> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.formGroup}>
          <label htmlFor="full_name" className={styles.label}>
            <i className="fas fa-user"></i> Полное имя
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="Введите ваше полное имя"
            required
          />
          <p className={styles.helpText}>
            Это имя будет отображаться в правом верхнем углу и в приветствиях
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            <i className="fas fa-at"></i> Имя пользователя
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="username"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.label}>
            <i className="fas fa-info-circle"></i> О себе
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Расскажите о себе..."
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="avatar_url" className={styles.label}>
            <i className="fas fa-image"></i> Ссылка на аватар
          </label>
          <input
            type="url"
            id="avatar_url"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <i className="fas fa-envelope"></i> Email
          </label>
          <input
            type="email"
            value={user?.email || ''}
            className={`${styles.input} ${styles.disabledInput}`}
            disabled
          />
          <p className={styles.helpText}>Email нельзя изменить</p>
        </div>

        <button 
          type="submit" 
          className={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Сохранение...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Сохранить изменения
            </>
          )}
        </button>
      </form>
    </div>
  );
}
