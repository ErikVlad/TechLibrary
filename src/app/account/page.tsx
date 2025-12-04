// app/account/page.tsx - исправленная версия
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import styles from './account.module.css';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at?: string;
}

interface FavoriteBook {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string | null;
  book_category: string | null;
  added_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  // Функция загрузки данных пользователя
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Загружаем профиль с обработкой ошибок
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Используем maybeSingle вместо single
      
      if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError);
      }
      
      if (profileData) {
        console.log('Профиль загружен:', profileData);
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
        });
      } else {
        // Если профиля нет в таблице profiles, используем данные из auth
        console.log('Профиль не найден в таблице profiles');
        setFormData({
          full_name: user.user_metadata?.full_name || '',
          bio: '',
        });
      }
      
      // Загружаем избранное
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      
      if (favoritesError) {
        console.error('Ошибка загрузки избранного:', favoritesError);
      } else if (favoritesData) {
        setFavorites(favoritesData);
      }
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Перенаправление если не авторизован
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Загрузка данных профиля
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleSaveProfile = async () => {
    if (!user) {
      alert('Пользователь не авторизован');
      return;
    }
    
    try {
      setSaving(true);
      
      console.log('Сохранение профиля...', {
        userId: user.id,
        formData: formData
      });
      
      // Сначала проверяем существует ли профиль
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      let result;
      
      if (checkError) {
        console.error('Ошибка проверки профиля:', checkError);
      }
      
      if (existingProfile) {
        // Профиль существует - обновляем
        console.log('Обновляем существующий профиль');
        result = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name || null,
            bio: formData.bio || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select();
      } else {
        // Профиля нет - создаем новый
        console.log('Создаем новый профиль');
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: formData.full_name || null,
            bio: formData.bio || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
      }
      
      const { data, error } = result;
      
      console.log('Ответ от Supabase:', { data, error });
      
      if (error) {
        console.error('Детали ошибки:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      // Обновляем локальное состояние
      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
      } : (data ? data[0] : null));
      
      setEditMode(false);
      alert('✅ Профиль успешно обновлен!');
      
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('❌ Ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm('Удалить из избранного?')) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      
      if (error) throw error;
      
      // Обновляем список
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      alert('✅ Книга удалена из избранного');
      
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('❌ Ошибка при удалении из избранного');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className={styles.accountContainer}>
        <div className={styles.accountCard}>
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Будет перенаправление
  }

  return (
    <div className={styles.accountContainer}>
      <div className={styles.accountCard}>
        {/* Хедер профиля */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div className={styles.profileInfo}>
              <h1>{profile?.full_name || formData.full_name || 'Пользователь'}</h1>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.memberSince}>
                Участник с {new Date(profile?.created_at || user.created_at || new Date()).toLocaleDateString('ru-RU')}
              </p>
              {profile?.updated_at && (
                <p className={styles.memberSince}>
                  Обновлено: {new Date(profile.updated_at).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
          </div>
          
          <div className={styles.actions}>
            <button 
              className={styles.editBtn}
              onClick={() => setEditMode(!editMode)}
              disabled={saving}
            >
              <i className="fas fa-edit"></i> {editMode ? 'Отменить' : 'Редактировать'}
            </button>
            <button 
              className={styles.logoutBtn}
              onClick={handleLogout}
              disabled={saving}
            >
              <i className="fas fa-sign-out-alt"></i> Выйти
            </button>
          </div>
        </div>

        {/* Навигация по табам */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Профиль
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <i className="fas fa-heart"></i> Избранное
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'activity' ? styles.active : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <i className="fas fa-history"></i> Активность
          </button>
        </div>

        {/* Контент табов */}
        <div className={styles.tabContent}>
          {activeTab === 'profile' && (
            <div className={styles.profileContent}>
              {saving && (
                <div className={styles.savingOverlay}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Сохранение...</p>
                </div>
              )}
              
              {editMode ? (
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Имя</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Ваше имя"
                      disabled={saving}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>О себе</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Расскажите о себе..."
                      rows={4}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      className={styles.saveBtn}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Сохранение...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> Сохранить
                        </>
                      )}
                    </button>
                    <button 
                      className={styles.cancelBtn}
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          full_name: profile?.full_name || '',
                          bio: profile?.bio || '',
                        });
                      }}
                      disabled={saving}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.profileView}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <i className="fas fa-user"></i>
                      <span>Имя:</span>
                    </div>
                    <div className={styles.infoValue}>
                      {profile?.full_name || formData.full_name || 'Не указано'}
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <i className="fas fa-envelope"></i>
                      <span>Email:</span>
                    </div>
                    <div className={styles.infoValue}>
                      {user.email}
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <i className="fas fa-info-circle"></i>
                      <span>О себе:</span>
                    </div>
                    <div className={styles.infoValue}>
                      {profile?.bio || formData.bio || 'Не указано'}
                    </div>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      <i className="fas fa-calendar-alt"></i>
                      <span>Дата регистрации:</span>
                    </div>
                    <div className={styles.infoValue}>
                      {new Date(profile?.created_at || user.created_at || new Date()).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className={styles.favoritesContent}>
              {favorites.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="fas fa-heart"></i>
                  <h3>Нет избранных книг</h3>
                  <p>Добавляйте книги в избранное, чтобы они появились здесь</p>
                  <Link href="/literature" className={styles.browseBtn}>
                    <i className="fas fa-book"></i> Перейти к каталогу
                  </Link>
                </div>
              ) : (
                <>
                  <div className={styles.favoritesStats}>
                    <p>Всего в избранном: <strong>{favorites.length}</strong> книг</p>
                  </div>
                  
                  <div className={styles.favoritesGrid}>
                    {favorites.map((fav) => (
                      <div key={fav.id} className={styles.favoriteCard}>
                        <div className={styles.favoriteIcon}>
                          <i className="fas fa-book"></i>
                        </div>
                        
                        <div className={styles.favoriteContent}>
                          <h4>{fav.book_title}</h4>
                          {fav.book_author && (
                            <p className={styles.favoriteAuthor}>
                              <i className="fas fa-user-pen"></i> {fav.book_author}
                            </p>
                          )}
                          {fav.book_category && (
                            <p className={styles.favoriteCategory}>
                              <i className="fas fa-tag"></i> {fav.book_category}
                            </p>
                          )}
                          <p className={styles.favoriteDate}>
                            Добавлено {new Date(fav.added_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        
                        <div className={styles.favoriteActions}>
                          <Link 
                            href={`/literature/${fav.book_id}`}
                            className={styles.viewBtn}
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button 
                            className={styles.removeBtn}
                            onClick={() => handleRemoveFavorite(fav.id)}
                            title="Удалить из избранного"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className={styles.activityContent}>
              <div className={styles.activityEmpty}>
                <i className="fas fa-chart-line"></i>
                <h3>Статистика активности</h3>
                <p>Здесь будет отображаться ваша активность в библиотеке</p>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="fas fa-book-open"></i>
                    </div>
                    <div className={styles.statValue}>0</div>
                    <div className={styles.statLabel}>Прочитано книг</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="fas fa-heart"></i>
                    </div>
                    <div className={styles.statValue}>{favorites.length}</div>
                    <div className={styles.statLabel}>В избранном</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className={styles.statValue}>0 ч</div>
                    <div className={styles.statLabel}>Время чтения</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}