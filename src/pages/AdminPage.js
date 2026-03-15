import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import AdminListingDetailModal from '../components/AdminListingDetailModal';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, pendingListings: 0, approvedListings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [pendingListings, setPendingListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loadingAllListings, setLoadingAllListings] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [allListingSearch, setAllListingSearch] = useState('');
  const [pendingListingSearch, setPendingListingSearch] = useState('');
  const [pendingListingDetail, setPendingListingDetail] = useState(null);
  const [allListingDetail, setAllListingDetail] = useState(null);
  const [confirmState, setConfirmState] = useState({ show: false, title: '', message: '', confirmLabel: 'Confirm', variant: 'primary', onConfirm: null });
  const [adminTab, setAdminTab] = useState('all');

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.get('/api/admin/stats');
      setStats({
        users: data.users ?? 0,
        pendingListings: data.pendingListings ?? 0,
        approvedListings: data.approvedListings ?? 0
      });
    } catch {
      setStats({ users: 0, pendingListings: 0, approvedListings: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    setLoadingListings(true);
    setError('');
    try {
      const data = await api.get('/api/admin/listings/pending');
      setPendingListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setPendingListings([]);
      setError(err.message || 'Failed to load pending listings');
    } finally {
      setLoadingListings(false);
    }
  }, []);

  const fetchAllListings = useCallback(async () => {
    setLoadingAllListings(true);
    setError('');
    try {
      const data = await api.get('/api/admin/listings');
      setAllListings(Array.isArray(data) ? data : []);
    } catch (err) {
      setAllListings([]);
      setError(err.message || 'Failed to load all listings');
    } finally {
      setLoadingAllListings(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await api.get('/api/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    fetchAllListings();
  }, [fetchAllListings]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const q = (userSearch || '').trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredAllListings = useMemo(() => {
    const q = (allListingSearch || '').trim().toLowerCase();
    if (!q) return allListings;
    return allListings.filter(
      (l) =>
        (l.title || '').toLowerCase().includes(q) ||
        (l.ownerEmail || '').toLowerCase().includes(q) ||
        (l.status || '').toLowerCase().includes(q)
    );
  }, [allListings, allListingSearch]);

  const filteredPendingListings = useMemo(() => {
    const q = (pendingListingSearch || '').trim().toLowerCase();
    if (!q) return pendingListings;
    return pendingListings.filter(
      (l) =>
        (l.title || '').toLowerCase().includes(q) ||
        (l.ownerEmail || '').toLowerCase().includes(q) ||
        (l.type || '').toLowerCase().includes(q)
    );
  }, [pendingListings, pendingListingSearch]);

  const handleListingStatus = async (listingId, status) => {
    try {
      await api.patch('/api/listings/' + listingId + '/status', { status });
      setError('');
      await fetchPending();
      await fetchAllListings();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to update listing');
      throw err;
    }
  };

  const handleRemoveListing = async (listingId) => {
    try {
      await api.delete('/api/admin/listings/' + listingId);
      setError('');
      setAllListingDetail(null);
      await fetchAllListings();
      await fetchPending();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to remove listing');
    }
  };

  const openRemoveListingConfirm = (listing) => {
    setAllListingDetail(null);
    setConfirmState({
      show: true,
      title: 'Remove listing?',
      message: 'This listing will be permanently deleted. This cannot be undone.',
      confirmLabel: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, show: false }));
        handleRemoveListing(listing.id);
      }
    });
  };

  const handleUserStatus = async (userId, accountStatus) => {
    try {
      await api.patch('/api/admin/users/' + userId, { accountStatus });
      setError('');
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const openRejectConfirm = (listing, closeDetailModal = false) => {
    setConfirmState({
      show: true,
      title: 'Reject listing?',
      message: 'This listing will be marked as rejected and won\'t be visible to the public.',
      confirmLabel: 'Reject',
      variant: 'danger',
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, show: false }));
        if (closeDetailModal) setPendingListingDetail(null);
        handleListingStatus(listing.id, 'rejected');
      }
    });
  };

  const openSuspendConfirm = (u) => {
    setConfirmState({
      show: true,
      title: 'Suspend user?',
      message: 'This user will not be able to log in until reactivated.',
      confirmLabel: 'Suspend',
      variant: 'danger',
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, show: false }));
        handleUserStatus(u.id, 'suspended');
      }
    });
  };

  const openBanConfirm = (u) => {
    setConfirmState({
      show: true,
      title: 'Ban user?',
      message: 'This user will be banned and cannot log in.',
      confirmLabel: 'Ban',
      variant: 'danger',
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, show: false }));
        handleUserStatus(u.id, 'banned');
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete('/api/admin/users/' + userId);
      setError('');
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Failed to delete user');
    }
  };

  const openDeleteUserConfirm = (u) => {
    setConfirmState({
      show: true,
      title: 'Delete user?',
      message: `Permanently delete ${u.email} and all their data (listings, favorites, saved searches, messages)? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        setConfirmState((s) => ({ ...s, show: false }));
        handleDeleteUser(u.id);
      }
    });
  };

  const closeConfirm = () => {
    setConfirmState((s) => ({ ...s, show: false, onConfirm: null }));
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link to="/" className="admin-back-link">
          <i className="fas fa-arrow-left" aria-hidden /> Back to site
        </Link>
        <h1 className="admin-title">Admin <span className="admin-title-sub">Dashboard</span></h1>
      </header>
      <div className="admin-body">
        {error && (
          <div className="admin-alert" role="alert">
            {error}
          </div>
        )}

        {/* Overview stats */}
        <section className="admin-overview" aria-label="Overview">
          <h2 className="admin-section-title">Overview</h2>
          {loadingStats ? (
            <p className="admin-muted">Loading…</p>
          ) : (
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-value">{stats.users}</span>
                <span className="admin-stat-label">Total users</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-value">{stats.pendingListings}</span>
                <span className="admin-stat-label">Pending listings</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-value">{stats.approvedListings}</span>
                <span className="admin-stat-label">Approved listings</span>
              </div>
            </div>
          )}
        </section>

        {/* Tab nav */}
        <nav className="admin-nav" aria-label="Sections">
          <button
            type="button"
            className={`admin-nav-link ${adminTab === 'all' ? 'active' : ''}`}
            onClick={() => setAdminTab('all')}
          >
            All listings
          </button>
          <button
            type="button"
            className={`admin-nav-link ${adminTab === 'pending' ? 'active' : ''}`}
            onClick={() => setAdminTab('pending')}
          >
            Pending listings
          </button>
          <button
            type="button"
            className={`admin-nav-link ${adminTab === 'users' ? 'active' : ''}`}
            onClick={() => setAdminTab('users')}
          >
            Users
          </button>
        </nav>

        {/* Single prerendered table — content switches by tab */}
        <section className="admin-section admin-section-card">
          <h2 className="admin-section-title">
            {adminTab === 'all' && 'All listings'}
            {adminTab === 'pending' && 'Pending listings'}
            {adminTab === 'users' && 'Users'}
          </h2>
          {adminTab === 'all' && (
            <div className="admin-users-search">
              <input
                type="search"
                className="admin-search-input"
                placeholder="Search by title or owner email…"
                value={allListingSearch}
                onChange={(e) => setAllListingSearch(e.target.value)}
                aria-label="Search all listings"
              />
            </div>
          )}
          {adminTab === 'pending' && (
            <div className="admin-users-search">
              <input
                type="search"
                className="admin-search-input"
                placeholder="Search by title, owner, or type…"
                value={pendingListingSearch}
                onChange={(e) => setPendingListingSearch(e.target.value)}
                aria-label="Search pending listings"
              />
            </div>
          )}
          {adminTab === 'users' && (
            <div className="admin-users-search">
              <input
                type="search"
                className="admin-search-input"
                placeholder="Search by email or name…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                aria-label="Search users"
              />
            </div>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {adminTab === 'all' && (
                    <>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </>
                  )}
                  {adminTab === 'pending' && (
                    <>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </>
                  )}
                  {adminTab === 'users' && (
                    <>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(adminTab === 'all' && loadingAllListings) || (adminTab === 'pending' && loadingListings) || (adminTab === 'users' && loadingUsers) ? (
                  <tr>
                    <td colSpan={adminTab === 'users' ? 5 : adminTab === 'pending' ? 5 : 7} className="admin-table-empty">Loading…</td>
                  </tr>
                ) : (adminTab === 'all' && allListings.length === 0) || (adminTab === 'pending' && (pendingListings.length === 0 || filteredPendingListings.length === 0)) || (adminTab === 'users' && users.length === 0) ? (
                  <tr>
                    <td colSpan={adminTab === 'users' ? 5 : adminTab === 'pending' ? 5 : 7} className="admin-table-empty">
                      {adminTab === 'all' && 'No listings.'}
                      {adminTab === 'pending' && (pendingListings.length === 0 ? 'No pending listings.' : 'No matches.')}
                      {adminTab === 'users' && 'No users.'}
                    </td>
                  </tr>
                ) : (
                  <>
                  {adminTab === 'all' && filteredAllListings.map((l) => (
                    <tr
                      key={l.id}
                      className="admin-table-row-clickable"
                      onClick={() => setAllListingDetail(l)}
                    >
                      <td>{l.title}</td>
                      <td>{l.ownerEmail || '—'}</td>
                      <td>{l.type} / {l.listingType}</td>
                      <td>
                        <span className={`admin-badge admin-badge-listing-${l.status === 'approved' ? 'approved' : l.status === 'rejected' ? 'rejected' : l.status === 'unlisted' ? 'unlisted' : 'pending'}`}>
                          {l.status || '—'}
                        </span>
                      </td>
                      <td className="admin-table-price">₱{Number(l.price).toLocaleString()}</td>
                      <td>{l.datePosted || '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {l.status === 'approved' && (
                          <button type="button" className="admin-btn admin-btn-warning admin-btn-sm me-1" onClick={() => handleListingStatus(l.id, 'unlisted').catch(() => {})}>Unlist</button>
                        )}
                        {(l.status === 'rejected' || l.status === 'unlisted') && (
                          <button type="button" className="admin-btn admin-btn-success admin-btn-sm me-1" onClick={() => handleListingStatus(l.id, 'approved').catch(() => {})}>Relist</button>
                        )}
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => openRemoveListingConfirm(l)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                  {adminTab === 'pending' && filteredPendingListings.map((l) => (
                    <tr
                      key={l.id}
                      className="admin-table-row-clickable"
                      onClick={() => setPendingListingDetail(l)}
                    >
                      <td>{l.title}</td>
                      <td>{l.type} / {l.listingType}</td>
                      <td className="admin-table-price">₱{Number(l.price).toLocaleString()}</td>
                      <td>{l.datePosted || '—'}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleListingStatus(l.id, 'approved').catch(() => {})}>Approve</button>
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => openRejectConfirm(l)}>Reject</button>
                      </td>
                    </tr>
                  ))}
                  {adminTab === 'users' && filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.name || '—'}</td>
                      <td>
                        <span className={`admin-badge admin-badge-role admin-badge-role-${u.role || 'user'}`}>{u.role || 'user'}</span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-status admin-badge-status-${u.accountStatus || 'active'}`}>{u.accountStatus || 'active'}</span>
                      </td>
                      <td>
                        {u.id === user?.id ? (
                          <span className="admin-you">(you)</span>
                        ) : (
                          <>
                            <button type="button" className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleUserStatus(u.id, 'active')} disabled={u.accountStatus === 'active'}>Activate</button>
                            <button type="button" className="admin-btn admin-btn-warning admin-btn-sm" onClick={() => openSuspendConfirm(u)} disabled={u.accountStatus === 'suspended'}>Suspend</button>
                            <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => openBanConfirm(u)} disabled={u.accountStatus === 'banned'}>Ban</button>
                            {u.id !== user?.id && (
                              <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => openDeleteUserConfirm(u)} title="Permanently delete user and all data">Delete</button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AdminListingDetailModal
        listing={pendingListingDetail}
        show={!!pendingListingDetail}
        onClose={() => setPendingListingDetail(null)}
        onApprove={(id) => handleListingStatus(id, 'approved')}
        onReject={(listing) => {
          handleListingStatus(listing.id, 'rejected');
          setPendingListingDetail(null);
        }}
        onRejectConfirm={(listing) => openRejectConfirm(listing, true)}
      />

      <AdminListingDetailModal
        listing={allListingDetail}
        show={!!allListingDetail}
        variant="all"
        onClose={() => setAllListingDetail(null)}
        onUnlist={(id) => handleListingStatus(id, 'unlisted')}
        onRelist={(id) => handleListingStatus(id, 'approved')}
        onRemove={(listing) => openRemoveListingConfirm(listing)}
      />

      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={() => {
          if (confirmState.onConfirm) confirmState.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </div>
  );
}
