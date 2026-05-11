(function () {
  const config = window.FIXLAB_SUPABASE_CONFIG || {};
  const table = config.table || "fixlab_records";
  const cache = {};
  let client = null;
  let readyPromise = null;

  const keyMap = {
    fixlab_db_users: "users",
    fixlab_db_reservations: "reservations",
    fixlab_db_session: "sessions",
    fixlabReviews: "reviews",
    fixlab_db_settings: "settings"
  };

  function isConfigured() {
    return Boolean(
      config.url &&
      config.anonKey &&
      !config.url.includes("PON_AQUI") &&
      !config.anonKey.includes("PON_AQUI")
    );
  }

  function collectionName(key) {
    return keyMap[key] || key;
  }

  function getRecordId(doc) {
    return String(
      doc?._id ||
      doc?.orderNumber ||
      doc?.code ||
      doc?.email ||
      doc?.id ||
      `fl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    );
  }

  function normalizeRow(row) {
    const data = row.data || {};
    return {
      ...data,
      _id: data._id || row.record_id,
      updatedAt: data.updatedAt || row.updated_at,
      createdAt: data.createdAt || row.created_at
    };
  }

  function initClient() {
    if (!isConfigured()) {
      console.warn("Supabase no está configurado. Edita assets/js/supabase-config.js.");
      return null;
    }
    if (!window.supabase || !window.supabase.createClient) {
      console.error("No se ha cargado @supabase/supabase-js.");
      return null;
    }
    if (!client) {
      client = window.supabase.createClient(config.url, config.anonKey);
    }
    return client;
  }

  async function loadCollection(key) {
    const supabaseClient = initClient();
    const collection = collectionName(key);
    if (!supabaseClient) {
      cache[key] = [];
      return cache[key];
    }

    const { data, error } = await supabaseClient
      .from(table)
      .select("*")
      .eq("collection", collection)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase: error cargando", collection, error);
      cache[key] = [];
      return cache[key];
    }

    cache[key] = (data || []).map(normalizeRow);
    return cache[key];
  }

  async function loadAll(keys) {
    const uniqueKeys = Array.from(new Set(keys || Object.keys(keyMap)));
    await Promise.all(uniqueKeys.map(loadCollection));
    return cache;
  }

  async function saveCollection(key, docs) {
    const supabaseClient = initClient();
    const collection = collectionName(key);
    const list = Array.isArray(docs) ? docs : [];
    cache[key] = list;

    if (!supabaseClient) return false;

    const rows = list.map((doc) => {
      const recordId = getRecordId(doc);
      const now = new Date().toISOString();
      const data = {
        ...doc,
        _id: doc._id || recordId,
        updatedAt: doc.updatedAt || now,
        createdAt: doc.createdAt || now
      };
      return {
        collection,
        record_id: recordId,
        data,
        updated_at: data.updatedAt,
        created_at: data.createdAt
      };
    });

    const { error: deleteError } = await supabaseClient
      .from(table)
      .delete()
      .eq("collection", collection);

    if (deleteError) {
      console.error("Supabase: error limpiando", collection, deleteError);
      return false;
    }

    if (rows.length === 0) return true;

    const { error } = await supabaseClient
      .from(table)
      .upsert(rows, { onConflict: "collection,record_id" });

    if (error) {
      console.error("Supabase: error guardando", collection, error);
      return false;
    }
    return true;
  }

  async function upsertOne(key, doc) {
    const current = cache[key] || [];
    const id = getRecordId(doc);
    const index = current.findIndex((item) => getRecordId(item) === id);
    const next = { ...doc, _id: doc._id || id, updatedAt: new Date().toISOString() };
    if (!next.createdAt) next.createdAt = new Date().toISOString();
    if (index >= 0) current[index] = next;
    else current.push(next);
    cache[key] = current;

    const supabaseClient = initClient();
    if (!supabaseClient) return next;

    const { error } = await supabaseClient
      .from(table)
      .upsert({
        collection: collectionName(key),
        record_id: id,
        data: next,
        created_at: next.createdAt,
        updated_at: next.updatedAt
      }, { onConflict: "collection,record_id" });

    if (error) console.error("Supabase: error guardando registro", error);
    return next;
  }

  function getCollectionSync(key) {
    return cache[key] ? [...cache[key]] : [];
  }

  readyPromise = loadAll();

  window.FixLabSupabaseDB = {
    isConfigured,
    ready: readyPromise,
    loadAll,
    loadCollection,
    getCollectionSync,
    saveCollection,
    upsertOne
  };
})();
