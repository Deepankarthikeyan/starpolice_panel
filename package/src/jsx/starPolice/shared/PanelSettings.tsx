import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api, storeAuth } from "../api";
import { getSidebarMenuOptions } from "../menuPreferences";
import { getPanelMotherMenu, formatAccountType } from "../panelLabels";
import { notify } from "../toast";

const PanelSettings = () => {
  const { auth, setAuth } = useContext(ThemeContext);
  const [hiddenItems, setHiddenItems] = useState<string[]>(auth?.sidebarHiddenItems || []);
  const [saving, setSaving] = useState(false);

  const menuOptions = useMemo(
    () => getSidebarMenuOptions(auth?.panel || "admin", auth),
    [auth],
  );

  useEffect(() => {
    setHiddenItems(auth?.sidebarHiddenItems || []);
  }, [auth?.sidebarHiddenItems]);

  const toggleMenuItem = (menuPath: string) => {
    setHiddenItems((current) => {
      if (current.includes(menuPath)) {
        return current.filter((item) => item !== menuPath);
      }
      const nextHidden = [...current, menuPath];
      if (nextHidden.length >= menuOptions.length) {
        notify.error("At least one sidebar menu item must remain visible.");
        return current;
      }
      return nextHidden;
    });
  };

  const saveSidebarPreferences = async () => {
    if (!auth) return;
    setSaving(true);
    try {
      const updated = await api.updateSidebarPreferences(hiddenItems, auth.panel);
      const nextAuth = { ...auth, ...updated, token: auth.token };
      storeAuth(nextAuth);
      setAuth(nextAuth);
      notify.success("Sidebar menu preferences saved.");
    } catch (error) {
      notify.error(error, "Failed to save sidebar preferences.");
    } finally {
      setSaving(false);
    }
  };

  const resetSidebarPreferences = () => {
    setHiddenItems([]);
  };

  return (
    <>
      <PageTitle
        motherMenu={getPanelMotherMenu(auth?.panel)}
        activeMenu="Settings"
        pageContent=""
      />
      <div className="row">
        <div className="col-xl-8">
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="card-title mb-0">Account Settings</h4>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label">Display Name</label>
                <input type="text" className="form-control" value={auth?.name ?? ""} readOnly />
              </div>
              <div className="mb-4">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={auth?.email ?? ""} readOnly />
              </div>
              <div className="mb-0">
                <label className="form-label">Account Type</label>
                <input
                  type="text"
                  className="form-control text-capitalize"
                  value={formatAccountType(auth?.role)}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Sidebar Menu</h4>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                Choose which sidebar options you want to see. Turn off any menu you do not need.
              </p>
              <div className="spa-permission-list">
                {menuOptions.map((option) => {
                  const isVisible = !hiddenItems.includes(option.to);
                  return (
                    <label key={option.to} className="spa-permission-item">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isVisible}
                        onChange={() => toggleMenuItem(option.to)}
                      />
                      <span>
                        <strong>{option.title}</strong>
                        <small className="d-block text-muted">{option.description}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveSidebarPreferences}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Sidebar Preferences"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetSidebarPreferences}
                  disabled={saving || hiddenItems.length === 0}
                >
                  Show All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelSettings;
