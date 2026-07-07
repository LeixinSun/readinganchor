(() => {
  if (window.__readingAnchorExtension) {
    return;
  }

  const STORAGE_KEY = "readingAnchorSettings";
  const EXTENSION_FLAG = "data-reading-anchor-generated";
  const PANEL_ID = "reading-anchor-panel";
  const PANEL_REOPEN_ID = "reading-anchor-panel-reopen";
  const MAX_TEXT_NODES = 5000;
  const MIN_TEXT_LENGTH = 20;
  const VIEWPORT_MARGIN = 240;
  const BLOCK_TAGS = new Set(["P", "LI", "BLOCKQUOTE", "ARTICLE", "SECTION", "DIV", "TD", "TH"]);
  const SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "SVG",
    "CANVAS",
    "CODE",
    "PRE",
    "KBD",
    "SAMP",
    "INPUT",
    "TEXTAREA",
    "SELECT",
    "BUTTON",
    "MATH",
    "IFRAME",
  ]);
  const DENSITY_CONFIG = {
    low: { ratio: 0.07, hardCap: 10, contentCap: 4, minAnchors: 2 },
    medium: { ratio: 0.12, hardCap: 16, contentCap: 7, minAnchors: 3 },
    high: { ratio: 0.18, hardCap: 24, contentCap: 11, minAnchors: 4 },
  };
  const DEFAULT_SETTINGS = {
    density: "high",
    mode: "dense",
  };
  const STOPWORDS = new Set([
    "about", "above", "across", "after", "again", "against", "almost", "along",
    "already", "also", "although", "always", "among", "another", "around", "because",
    "before", "being", "below", "between", "both", "cannot", "could", "despite",
    "during", "either", "enough", "every", "first", "found", "from", "general",
    "given", "having", "here", "however", "important", "itself", "just", "likely",
    "little", "made", "many", "might", "moreover", "much", "must", "never", "often",
    "only", "other", "people", "perhaps", "quite", "rather", "really", "same",
    "should", "since", "still", "such", "than", "that", "their", "there", "these",
    "this", "those", "through", "toward", "under", "until", "upon", "using",
    "usually", "very", "well", "were", "what", "when", "where", "which", "while",
    "within", "without", "would",
  ]);
  const SUFFIX_HINTS = [
    "ization", "isation", "ologist", "ologies", "ography", "ability", "ibility",
    "ology", "ments", "ness", "ities", "ation", "ition", "tions", "sions",
    "ative", "ively", "fully", "ously", "ence", "ance", "ment", "able", "ible",
    "ship", "isms", "ists", "ical", "ally", "tion", "sion", "ical", "istic",
    "graph", "scope", "proof", "ative", "ition", "ance", "ence", "ness", "ism",
    "ist", "ity", "ive", "ous", "ing", "ize", "ise", "ed", "al", "ic",
  ];
  const PHRASE_CATEGORIES = [
    { className: "reading-anchor-logic", group: "marker", priority: 94, terms: ["on the other hand", "on the contrary", "by contrast", "in contrast", "by comparison", "in spite of", "even though", "rather than", "instead of", "at the same time"] },
    { className: "reading-anchor-logic", group: "marker", priority: 92, terms: ["because of", "due to", "owing to", "caused by", "driven by", "stems from", "results from", "leads to", "gives rise to", "depends on", "as a result of", "this is because"] },
    { className: "reading-anchor-logic", group: "marker", priority: 92, terms: ["as a result", "for this reason", "this means that", "which means that", "this suggests that", "this indicates that", "this implies that", "in conclusion", "in summary"] },
    { className: "reading-anchor-logic", group: "marker", priority: 90, terms: ["for example", "for instance", "such as", "in particular", "in other words", "that is", "to illustrate"] },
    { className: "reading-anchor-logic", group: "marker", priority: 84, terms: ["to begin with", "to start with", "at first", "in the meantime", "at the end"] },
    { className: "reading-anchor-problem", group: "important", priority: 90, terms: ["to address this", "to solve this", "to test this", "to evaluate this", "the goal is to", "the question is whether"] },
    { className: "reading-anchor-important", group: "important", priority: 86, terms: ["the key point", "the main point", "the central idea", "the main conclusion", "the main finding", "taken together"] },
    { className: "reading-anchor-claim", group: "claim", priority: 82, terms: ["tends to", "appears to", "seems to", "is likely to", "is unlikely to", "is consistent with", "is associated with", "can be interpreted as"] },
    { className: "reading-anchor-problem", group: "important", priority: 86, terms: ["open question", "key idea", "core idea", "main reason", "main goal", "main limitation", "key challenge", "main result", "our approach", "this approach", "this method", "the evidence"] },
    { className: "reading-anchor-logic", group: "marker", priority: 88, terms: ["more than", "less than", "compared with", "compared to", "relative to", "similar to", "different from", "contrary to"] },
    { className: "reading-anchor-logic", group: "marker", priority: 90, terms: ["only if", "even if", "fails to", "does not", "do not", "did not", "cannot be"] },
  ];
  const WORD_CATEGORIES = [
    { className: "reading-anchor-logic", group: "marker", priority: 88, terms: ["however", "although", "though", "whereas", "despite", "nevertheless", "nonetheless", "instead", "alternatively", "conversely"] },
    { className: "reading-anchor-logic", group: "marker", priority: 84, terms: ["but", "yet", "still", "while", "similarly", "likewise", "meanwhile", "overall"] },
    { className: "reading-anchor-logic", group: "marker", priority: 86, terms: ["because", "therefore", "thus", "hence", "consequently", "accordingly"] },
    { className: "reading-anchor-logic", group: "marker", priority: 80, terms: ["including", "especially", "specifically", "namely", "notably", "particularly"] },
    { className: "reading-anchor-logic", group: "marker", priority: 76, terms: ["first", "second", "third", "finally", "next", "then", "meanwhile", "previously", "subsequently", "initially", "eventually"] },
    { className: "reading-anchor-important", group: "important", priority: 82, terms: ["important", "key", "main", "central", "crucial", "critical", "essential", "significant", "major", "primary", "fundamental", "notable", "meaningful", "relevant", "core"] },
    { className: "reading-anchor-claim", group: "claim", priority: 80, terms: ["may", "might", "could", "likely", "unlikely", "possibly", "potentially", "generally", "often", "usually", "apparently", "arguably", "presumably"] },
    { className: "reading-anchor-claim", group: "claim", priority: 84, terms: ["suggests", "indicates", "implies", "demonstrates", "shows", "proves", "confirms", "reveals", "reports", "estimates", "observes", "argues"] },
    { className: "reading-anchor-problem", group: "important", priority: 84, terms: ["problem", "issue", "challenge", "limitation", "risk", "concern", "drawback", "weakness", "failure", "error", "gap", "assumption", "tradeoff"] },
    { className: "reading-anchor-problem", group: "important", priority: 80, terms: ["solution", "approach", "method", "strategy", "evidence", "result", "finding", "benefit", "advantage", "improvement", "objective", "goal", "purpose"] },
    { className: "reading-anchor-important", group: "important", priority: 80, terms: ["propose", "introduce", "analyze", "examine", "evaluate", "compare", "identify", "assess", "measure", "summarize"] },
    { className: "reading-anchor-important", group: "important", priority: 78, terms: ["factor", "effect", "impact", "outcome", "implication", "explanation", "analysis", "experiment", "evaluation", "benchmark", "baseline", "conclusion", "summary", "reason", "question", "claim"] },
    { className: "reading-anchor-logic", group: "marker", priority: 74, terms: ["increase", "decrease", "improve", "reduce", "higher", "lower", "better", "worse", "stronger", "weaker"] },
    { className: "reading-anchor-logic", group: "marker", priority: 86, terms: ["not", "no", "never", "without", "neither", "nor", "except", "unless", "cannot"] },
  ];

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function compilePattern(term, options) {
    const normalized = escapeRegExp(term).replace(/\s+/g, "\\s+");
    const source = options.isPhrase ? `\\b${normalized}\\b` : `\\b${normalized}\\b`;
    return new RegExp(source, "gi");
  }

  function buildKeywordPatterns() {
    const phrasePatterns = [];
    const wordPatterns = [];

    for (const category of PHRASE_CATEGORIES) {
      for (const term of category.terms) {
        phrasePatterns.push({
          term,
          className: category.className,
          group: category.group,
          priority: category.priority,
          regex: compilePattern(term, { isPhrase: true }),
        });
      }
    }

    for (const category of WORD_CATEGORIES) {
      for (const term of category.terms) {
        wordPatterns.push({
          term,
          className: category.className,
          group: category.group,
          priority: category.priority,
          regex: compilePattern(term, { isPhrase: false }),
        });
      }
    }

    phrasePatterns.sort((left, right) => right.term.length - left.term.length);
    wordPatterns.sort((left, right) => right.term.length - left.term.length);
    return { phrasePatterns, wordPatterns };
  }

  const KEYWORD_PATTERNS = buildKeywordPatterns();

  function normalizeSettings(input) {
    const density = DENSITY_CONFIG[input?.density] ? input.density : DEFAULT_SETTINGS.density;
    const mode = ["structure", "balanced", "dense"].includes(input?.mode) ? input.mode : DEFAULT_SETTINGS.mode;
    return { density, mode };
  }

  function cloneTextNode(node) {
    return document.createTextNode(node.textContent || "");
  }

  const controller = {
    initialized: false,
    active: false,
    settings: { ...DEFAULT_SETTINGS },
    replacements: [],
    panel: null,
    reopenButton: null,
    loadSettingsPromise: null,
    documentContext: null,

    async init() {
      if (this.initialized) {
        return;
      }

      this.initialized = true;
      this.loadSettingsPromise = chrome.storage.local.get(STORAGE_KEY)
        .then((result) => {
          this.settings = normalizeSettings(result[STORAGE_KEY] || DEFAULT_SETTINGS);
          this.syncPanelState();
        })
        .catch(() => {
          this.settings = { ...DEFAULT_SETTINGS };
        });

      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (!message || typeof message.type !== "string") {
          return false;
        }

        if (message.type === "READING_ANCHOR_TOGGLE") {
          this.toggle().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
          return true;
        }

        return false;
      });
    },

    async toggle() {
      if (this.loadSettingsPromise) {
        await this.loadSettingsPromise;
      }

      if (this.active) {
        this.restore({ removePanel: true });
        return;
      }

      this.apply();
    },

    apply() {
      if (this.active) {
        return;
      }

      this.documentContext = this.buildDocumentContext();
      const textNodes = this.collectTextNodes();
      const paragraphStates = this.buildParagraphStates(textNodes);

      for (const item of textNodes) {
        this.processTextNode(item.node, paragraphStates.get(item.paragraph));
      }

      this.active = true;
      this.removeReopenButton();
      this.createFloatingPanel();
      this.syncPanelState();
    },

    restore(options = {}) {
      const removePanel = options.removePanel !== false;

      for (let index = this.replacements.length - 1; index >= 0; index -= 1) {
        const replacement = this.replacements[index];
        const { insertedNodes, originalNode } = replacement;
        const firstAttachedNode = insertedNodes.find((node) => node.parentNode);

        if (!firstAttachedNode || !firstAttachedNode.parentNode) {
          continue;
        }

        const parent = firstAttachedNode.parentNode;
        parent.insertBefore(originalNode, firstAttachedNode);

        for (const node of insertedNodes) {
          if (node.parentNode === parent) {
            parent.removeChild(node);
          }
        }
      }

      this.replacements = [];
      this.active = false;
      this.documentContext = null;
      this.removeReopenButton();
      if (removePanel) {
        this.removeFloatingPanel();
      } else {
        this.createFloatingPanel();
        this.syncPanelState();
      }
    },

    refresh() {
      const wasActive = this.active;
      if (wasActive) {
        this.restore({ removePanel: false });
      }

      if (wasActive) {
        this.apply();
      }
    },

    collectTextNodes() {
      const results = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => this.shouldProcessTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
      });

      let current = walker.nextNode();
      while (current && results.length < MAX_TEXT_NODES) {
        const paragraph = this.getParagraphContext(current.parentElement);
        if (paragraph && this.isElementNearViewport(paragraph)) {
          results.push({ node: current, paragraph });
        }
        current = walker.nextNode();
      }

      return results;
    },

    shouldProcessTextNode(node) {
      if (!node || !node.parentElement) {
        return false;
      }

      const text = node.textContent || "";
      if (text.trim().length < MIN_TEXT_LENGTH) {
        return false;
      }

      let element = node.parentElement;
      while (element) {
        if (element.id === PANEL_ID || element.hasAttribute(EXTENSION_FLAG)) {
          return false;
        }

        if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
          return false;
        }

        if (SKIP_TAGS.has(element.tagName)) {
          return false;
        }

        element = element.parentElement;
      }

      const parent = node.parentElement;
      const style = window.getComputedStyle(parent);
      if (style.visibility === "hidden" || style.display === "none") {
        return false;
      }

      return parent.getClientRects().length > 0;
    },

    getParagraphContext(element) {
      let current = element;
      while (current && current !== document.body) {
        if (BLOCK_TAGS.has(current.tagName)) {
          return current;
        }
        current = current.parentElement;
      }
      return element || document.body;
    },

    isElementNearViewport(element) {
      const rect = element.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        return false;
      }

      return rect.bottom >= -VIEWPORT_MARGIN
        && rect.top <= window.innerHeight + VIEWPORT_MARGIN
        && rect.right >= -VIEWPORT_MARGIN
        && rect.left <= window.innerWidth + VIEWPORT_MARGIN;
    },

    buildParagraphStates(textNodes) {
      const map = new Map();

      for (const item of textNodes) {
        if (!map.has(item.paragraph)) {
          map.set(item.paragraph, {
            meaningfulWords: 0,
            remainingAnchors: 0,
            remainingContent: 0,
            chunks: [],
            topicScores: new Map(),
          });
        }

        const state = map.get(item.paragraph);
        state.meaningfulWords += this.countMeaningfulWords(item.node.textContent || "");
        state.chunks.push(item.node.textContent || "");
      }

      for (const state of map.values()) {
        const density = DENSITY_CONFIG[this.settings.density];
        state.remainingAnchors = Math.min(
          density.hardCap,
          Math.max(density.minAnchors, Math.ceil(state.meaningfulWords * density.ratio))
        );
        state.remainingContent = this.settings.mode === "structure" ? 0 : density.contentCap;
        state.topicScores = this.extractScoredTerms(state.chunks.join(" "), this.settings.mode);
      }

      return map;
    },

    countMeaningfulWords(text) {
      const words = text.match(/[A-Za-z][A-Za-z'-]*/g);
      return words ? words.length : 0;
    },

    processTextNode(node, paragraphState) {
      if (!paragraphState || paragraphState.remainingAnchors <= 0) {
        return;
      }

      const fragment = this.buildAnchoredFragment(node.textContent || "", this.settings, paragraphState);
      if (!fragment) {
        return;
      }

      const insertedNodes = Array.from(fragment.childNodes);
      if (!insertedNodes.length) {
        return;
      }

      const originalNode = cloneTextNode(node);
      node.replaceWith(fragment);
      this.replacements.push({ originalNode, insertedNodes });
    },

    buildAnchoredFragment(text, settings, paragraphState) {
      const keywordMatches = this.findKeywordMatches(text, settings);
      const contentMatches = settings.mode === "structure"
        ? []
        : this.findContentMatches(text, settings, keywordMatches, paragraphState);
      const selectedMatches = this.selectMatches(keywordMatches, contentMatches, paragraphState);

      if (!selectedMatches.length) {
        return null;
      }

      const fragment = document.createDocumentFragment();
      let cursor = 0;

      for (const match of selectedMatches) {
        if (match.start > cursor) {
          fragment.appendChild(document.createTextNode(text.slice(cursor, match.start)));
        }

        fragment.appendChild(this.createMatchNode(match));
        cursor = match.end;
      }

      if (cursor < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(cursor)));
      }

      return fragment;
    },

    findKeywordMatches(text, settings) {
      const modeGroups = this.getAllowedGroups(settings.mode);
      const matches = [];

      for (const pattern of KEYWORD_PATTERNS.phrasePatterns) {
        if (!modeGroups.has(pattern.group)) {
          continue;
        }

        matches.push(...this.collectRegexMatches(text, pattern, false));
      }

      for (const pattern of KEYWORD_PATTERNS.wordPatterns) {
        if (!modeGroups.has(pattern.group)) {
          continue;
        }

        matches.push(...this.collectRegexMatches(text, pattern, false));
      }

      return this.removeOverlaps(matches);
    },

    collectRegexMatches(text, pattern, isContent) {
      const matches = [];
      pattern.regex.lastIndex = 0;
      let result = pattern.regex.exec(text);

      while (result) {
        const value = result[0];
        matches.push({
          start: result.index,
          end: result.index + value.length,
          length: value.length,
          className: pattern.className,
          group: pattern.group,
          priority: pattern.priority,
          text: value,
          isContent,
        });

        result = pattern.regex.exec(text);
      }

      return matches;
    },

    getAllowedGroups(mode) {
      if (mode === "structure") {
        return new Set(["marker"]);
      }

      return new Set(["marker", "claim", "important"]);
    },

    findContentMatches(text, settings, existingMatches, paragraphState) {
      const occupiedRanges = existingMatches.map((match) => [match.start, match.end]);
      const matches = [];
      const wordRegex = /\b[A-Za-z][A-Za-z'-]{5,}\b/g;
      let result = wordRegex.exec(text);

      while (result) {
        const word = result[0];
        const lowerWord = word.toLowerCase();
        const start = result.index;
        const end = start + word.length;

        if (this.rangeOverlaps(start, end, occupiedRanges)) {
          result = wordRegex.exec(text);
          continue;
        }

        const contentInfo = this.getContentWordInfo(lowerWord, settings.mode, paragraphState);
        if (!contentInfo) {
          result = wordRegex.exec(text);
          continue;
        }

        matches.push({
          start,
          end,
          length: word.length,
          className: contentInfo.className,
          group: "content",
          priority: contentInfo.priority,
          text: word,
          isContent: true,
          prefixLength: contentInfo.prefixLength,
        });

        result = wordRegex.exec(text);
      }

      matches.sort((left, right) => {
        if (left.priority !== right.priority) {
          return right.priority - left.priority;
        }
        if (left.length !== right.length) {
          return right.length - left.length;
        }
        return left.start - right.start;
      });

      return matches;
    },

    hasPreferredSuffix(word) {
      return SUFFIX_HINTS.some((suffix) => word.endsWith(suffix));
    },

    getPrefixLength(word, mode) {
      const length = word.length;
      if (length < 8) {
        return 0;
      }

      if (length <= 9) {
        return 5;
      }

      if (length <= 12) {
        return 6;
      }

      if (mode === "dense") {
        return 7;
      }

      return 6;
    },

    rangeOverlaps(start, end, ranges) {
      return ranges.some(([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart);
    },

    buildDocumentContext() {
      const headingTexts = [
        document.title || "",
        ...Array.from(document.querySelectorAll("h1, h2, h3"))
          .slice(0, 12)
          .map((element) => element.textContent || ""),
      ];

      return {
        focusTerms: this.extractFocusTerms(headingTexts.join(" ")),
      };
    },

    extractFocusTerms(text) {
      const focusTerms = new Set();
      const words = text.match(/\b[A-Za-z][A-Za-z'-]{5,}\b/g) || [];

      for (const rawWord of words) {
        const word = rawWord.toLowerCase();
        if (STOPWORDS.has(word)) {
          continue;
        }

        if (this.hasPreferredSuffix(word) || word.length >= 8) {
          focusTerms.add(word);
        }
      }

      return focusTerms;
    },

    extractScoredTerms(text, mode) {
      const counts = new Map();
      const words = text.match(/\b[A-Za-z][A-Za-z'-]{5,}\b/g) || [];

      for (const rawWord of words) {
        const word = rawWord.toLowerCase();
        if (STOPWORDS.has(word)) {
          continue;
        }

        counts.set(word, (counts.get(word) || 0) + 1);
      }

      const scores = new Map();

      for (const [word, frequency] of counts.entries()) {
        let score = 0;

        if (frequency > 1) {
          score += (frequency - 1) * 3;
        }

        if (this.hasPreferredSuffix(word)) {
          score += 3;
        }

        if (word.length >= 12) {
          score += 2;
        } else if (word.length >= 8) {
          score += 1;
        }

        if (mode === "dense" && word.length >= 8) {
          score += 1;
        }

        if (score >= 3) {
          scores.set(word, score);
        }
      }

      return scores;
    },

    getContentWordInfo(word, mode, paragraphState) {
      if (STOPWORDS.has(word)) {
        return null;
      }

      const paragraphScore = paragraphState?.topicScores.get(word) || 0;
      const headingBoost = this.documentContext?.focusTerms.has(word) ? 3 : 0;
      const suffixBoost = this.hasPreferredSuffix(word) ? 3 : 0;
      const lengthBoost = word.length >= 12 ? 2 : word.length >= 9 ? 1 : 0;
      let score = paragraphScore + headingBoost + suffixBoost + lengthBoost;

      if (mode === "dense" && word.length >= 8) {
        score += 1;
      }

      const minimumScore = mode === "dense" ? 4 : 6;
      if (score < minimumScore) {
        return null;
      }

      return {
        className: paragraphScore + headingBoost >= 6 ? "reading-anchor-important" : "reading-anchor-content",
        priority: 48 + score,
        prefixLength: word.length >= 8 ? this.getPrefixLength(word, mode) : 0,
      };
    },

    removeOverlaps(matches) {
      const sorted = [...matches].sort((left, right) => {
        if (left.start !== right.start) {
          return left.start - right.start;
        }
        if (left.length !== right.length) {
          return right.length - left.length;
        }
        if (left.priority !== right.priority) {
          return right.priority - left.priority;
        }
        return right.length - left.length;
      });
      const selected = [];
      let lastEnd = -1;

      for (const match of sorted) {
        if (match.start < lastEnd) {
          continue;
        }
        selected.push(match);
        lastEnd = match.end;
      }

      return selected;
    },

    selectMatches(keywordMatches, contentMatches, paragraphState) {
      const selected = [];
      let remainingAnchors = paragraphState.remainingAnchors;
      let remainingContent = paragraphState.remainingContent;
      const prioritizedKeywords = [...keywordMatches].sort((left, right) => {
        if (left.priority !== right.priority) {
          return right.priority - left.priority;
        }
        if (left.length !== right.length) {
          return right.length - left.length;
        }
        return left.start - right.start;
      });
      const prioritizedContent = [...contentMatches];
      const contentReserve = remainingContent > 0
        ? Math.min(remainingContent, Math.max(1, Math.ceil(remainingAnchors / 3)))
        : 0;
      const primaryKeywordBudget = Math.max(0, remainingAnchors - contentReserve);
      const leftoverKeywords = [];
      let usedKeywordSlots = 0;

      for (const match of prioritizedKeywords) {
        if (remainingAnchors <= 0) {
          break;
        }

        if (usedKeywordSlots < primaryKeywordBudget) {
          selected.push(match);
          remainingAnchors -= 1;
          usedKeywordSlots += 1;
          continue;
        }

        leftoverKeywords.push(match);
      }

      for (const match of prioritizedContent) {
        if (remainingAnchors <= 0 || remainingContent <= 0) {
          break;
        }

        selected.push(match);
        remainingAnchors -= 1;
        remainingContent -= 1;
      }

      for (const match of leftoverKeywords) {
        if (remainingAnchors <= 0) {
          break;
        }

        selected.push(match);
        remainingAnchors -= 1;
      }

      paragraphState.remainingAnchors = remainingAnchors;
      paragraphState.remainingContent = remainingContent;

      return selected.sort((left, right) => left.start - right.start);
    },

    createMatchNode(match) {
      const span = document.createElement("span");
      span.className = match.className;
      span.setAttribute(EXTENSION_FLAG, "true");

      if (match.isContent && match.prefixLength && match.prefixLength < match.text.length) {
        const prefix = document.createElement("span");
        prefix.className = "reading-anchor-prefix";
        prefix.textContent = match.text.slice(0, match.prefixLength);
        span.appendChild(prefix);
        span.appendChild(document.createTextNode(match.text.slice(match.prefixLength)));
        return span;
      }

      span.textContent = match.text;
      return span;
    },

    createFloatingPanel() {
      if (this.panel?.isConnected) {
        return;
      }

      this.removeReopenButton();
      const panel = document.createElement("aside");
      panel.id = PANEL_ID;
      panel.className = "reading-anchor-panel";
      panel.setAttribute(EXTENSION_FLAG, "true");
      panel.innerHTML = `
        <div class="reading-anchor-panel__inner">
          <div class="reading-anchor-panel__header">
            <div class="reading-anchor-panel__header-main">
              <p class="reading-anchor-panel__title">Reading Anchors</p>
              <label class="reading-anchor-panel__toggle">
                <input type="checkbox" data-role="enabled" checked>
                <span>On</span>
              </label>
            </div>
            <button type="button" class="reading-anchor-panel__dismiss" data-role="dismiss" aria-label="Hide panel">×</button>
          </div>
          <div class="reading-anchor-panel__group">
            <p class="reading-anchor-panel__label">Density</p>
            <div class="reading-anchor-panel__options reading-anchor-panel__options--triple">
              <button type="button" class="reading-anchor-panel__button" data-density="low">Low</button>
              <button type="button" class="reading-anchor-panel__button" data-density="medium">Medium</button>
              <button type="button" class="reading-anchor-panel__button" data-density="high">High</button>
            </div>
          </div>
          <div class="reading-anchor-panel__group">
            <p class="reading-anchor-panel__label">Mode</p>
            <div class="reading-anchor-panel__options">
              <button type="button" class="reading-anchor-panel__button" data-mode="structure">Structure</button>
              <button type="button" class="reading-anchor-panel__button" data-mode="balanced">Balanced</button>
              <button type="button" class="reading-anchor-panel__button" data-mode="dense">Dense</button>
            </div>
          </div>
          <button type="button" class="reading-anchor-panel__button reading-anchor-panel__button--reset" data-role="reset">Reset</button>
        </div>
      `;

      panel.addEventListener("click", (event) => {
        const target = event.target instanceof HTMLElement ? event.target : null;
        if (!target) {
          return;
        }

        const density = target.dataset.density;
        if (density && DENSITY_CONFIG[density]) {
          this.updateSettings({ density });
          return;
        }

        const mode = target.dataset.mode;
        if (mode) {
          this.updateSettings({ mode });
          return;
        }

        if (target.dataset.role === "dismiss") {
          this.hideFloatingPanel();
          return;
        }

        if (target.dataset.role === "reset") {
          this.updateSettings({ ...DEFAULT_SETTINGS });
        }
      });

      const enabledToggle = panel.querySelector('[data-role="enabled"]');
      if (enabledToggle instanceof HTMLInputElement) {
        enabledToggle.addEventListener("change", () => {
          if (enabledToggle.checked) {
            if (!this.active) {
              this.apply();
            }
            return;
          }

          if (this.active) {
            this.restore({ removePanel: false });
          }
        });
      }

      document.documentElement.appendChild(panel);
      this.panel = panel;
    },

    hideFloatingPanel() {
      this.removeFloatingPanel();
      if (this.active) {
        this.createReopenButton();
      }
    },

    removeFloatingPanel() {
      if (this.panel?.isConnected) {
        this.panel.remove();
      }
      this.panel = null;
    },

    createReopenButton() {
      if (this.reopenButton?.isConnected) {
        return;
      }

      const button = document.createElement("button");
      button.id = PANEL_REOPEN_ID;
      button.type = "button";
      button.className = "reading-anchor-panel-reopen";
      button.setAttribute(EXTENSION_FLAG, "true");
      button.textContent = "Reading Anchors";
      button.addEventListener("click", () => {
        this.createFloatingPanel();
        this.syncPanelState();
      });

      document.documentElement.appendChild(button);
      this.reopenButton = button;
    },

    removeReopenButton() {
      if (this.reopenButton?.isConnected) {
        this.reopenButton.remove();
      }
      this.reopenButton = null;
    },

    syncPanelState() {
      if (!this.panel?.isConnected) {
        return;
      }

      const enabledToggle = this.panel.querySelector('[data-role="enabled"]');
      if (enabledToggle instanceof HTMLInputElement) {
        enabledToggle.checked = this.active;
      }

      const densityButtons = this.panel.querySelectorAll("[data-density]");
      densityButtons.forEach((button) => {
        button.classList.toggle("is-active", button.getAttribute("data-density") === this.settings.density);
      });

      const modeButtons = this.panel.querySelectorAll("[data-mode]");
      modeButtons.forEach((button) => {
        button.classList.toggle("is-active", button.getAttribute("data-mode") === this.settings.mode);
      });
    },

    async updateSettings(nextSettings) {
      this.settings = normalizeSettings({ ...this.settings, ...nextSettings });
      this.syncPanelState();

      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: this.settings });
      } catch (_error) {
        // Ignore storage failures; the page effect still works with in-memory settings.
      }

      if (this.active) {
        this.refresh();
      }
    },
  };

  window.__readingAnchorExtension = controller;
  controller.init();
})();
